import { Button, Input, Table, theme } from "antd";
import { ColumnsType, TableProps } from "antd/es/table";
import { ScoreCategory, ScoreObjective } from "../types/score";
import { getImageLocation } from "../types/scoring-objective";
import { GlobalStateContext } from "../utils/context-provider";
import { useContext, useState } from "react";
import { cyanDark } from "@ant-design/colors";
import { BPLEvent } from "../types/event";
import { ObjectiveIcon } from "./objective-icon";

export type ItemTableProps = {
  category?: ScoreCategory;
  selectedTeam?: number;
  style?: React.CSSProperties;
  tableProps?: TableProps<any>;
};
const { useToken } = theme;

function imageOverlayedWithText(record: any, gameVersion: "poe1" | "poe2") {
  const img_location = getImageLocation(record.objective, gameVersion);
  if (!img_location) {
    return <></>;
  }
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        maxHeight: "60px",
      }}
    >
      <img
        src={img_location}
        style={{ maxWidth: "3.5em", maxHeight: "3.5em" }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          color: "white",
          padding: "0px",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0, 0, 0,1)", // Text shadow for better readability
        }}
      >
        {record.name}
      </div>
    </div>
  );
}

export function ItemTable({
  category,
  selectedTeam,
  style,
  tableProps,
}: ItemTableProps) {
  const { currentEvent, isMobile, gameVersion } =
    useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = useState<string | undefined>();
  if (!currentEvent || !category) {
    return <></>;
  }
  const [completionFilter, setCompletionFilter] = useState<{
    [teamId: number]: number;
  }>(
    currentEvent.teams.reduce((acc: { [teamId: number]: number }, team) => {
      acc[team.id] = 0;
      return acc;
    }, {})
  );

  const applyFilter = (row: any) => {
    if (
      nameFilter &&
      !row.key.toLowerCase().includes(nameFilter.toLowerCase())
    ) {
      return false;
    }
    for (const teamId in completionFilter) {
      if (completionFilter[teamId] === 1 && !row[teamId]) {
        return false;
      }
      if (completionFilter[teamId] === 2 && row[teamId]) {
        return false;
      }
    }
    return true;
  };

  const variantMap = category.sub_categories
    .filter((subCategory) => subCategory.name.includes("Variants"))
    .reduce((acc: { [name: string]: ScoreObjective[] }, subCategory) => {
      const name = subCategory.name.split("Variants")[0].trim();
      acc[name] = subCategory.objectives;
      return acc;
    }, {});

  const tableRows = category.objectives.map((objective) => {
    const row = {
      key: objective.name,
      name: objective.extra ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{objective.name}</div>
          <span style={{ color: useToken().token.colorPrimary }}>
            [{objective.extra}]
          </span>
        </div>
      ) : (
        objective.name
      ),
      extra: objective.extra,
      ...currentEvent.teams.reduce(
        (acc: { [teamId: number]: boolean }, team) => {
          acc[team.id] = objective.team_score[team.id].finished;
          return acc;
        },
        {}
      ),
      objective: objective,
    };
    if (variantMap[objective.name]) {
      row.name = (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{objective.name}</div>
          <span style={{ color: cyanDark[5] }}>[Click to toggle Variants]</span>
        </div>
      );
      // @ts-ignore - too lazy to fix it just works okay?!?!?
      row.children = variantMap[objective.name].map((variant) => {
        return {
          key: variant.name,
          name: variant.extra,
        };
      });
    }
    return row;
  });
  const tableColumns: ColumnsType = [
    ...(isMobile
      ? []
      : [
          {
            title: "",
            render: (row: any) => <ObjectiveIcon objective={row.objective} />,
            key: "image",
            width: 120,
          },
        ]),
    {
      title: (
        <Input
          placeholder="Name"
          allowClear
          onChange={(e) => setNameFilter(e.target.value)}
        ></Input>
      ),

      key: "name",
      render: (record: any) => {
        if (isMobile) {
          return imageOverlayedWithText(record, gameVersion);
        }
        return record.name;
      },
    },
    ...getCompletionColumns(currentEvent, selectedTeam || 0, isMobile),
  ];

  function getCompletionColumns(
    event: BPLEvent,
    selectedTeam: number,
    isMobile: boolean
  ) {
    if (isMobile) {
      return [
        {
          title: "Status",
          key: "status",
          render: (record: any) => {
            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "8px",
                }}
              >
                {event.teams.slice().map((team) => {
                  return (
                    <div
                      key={team.id + "_" + record.id}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {record[team.id] ? "✅" : "❌"}
                      <span style={{ marginLeft: "8px" }}>{team.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          },
        },
      ];
    }
    return event.teams
      .slice()
      .sort((a, b) =>
        a.id === selectedTeam ? -1 : b.id === selectedTeam ? 1 : 0
      )
      .map((team) => ({
        title: (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div>{team.name}</div>
              <Button
                style={{ marginLeft: 8 }}
                icon={[null, "✅", "❌"][completionFilter[team.id]]}
                onClick={(e) => {
                  const newFilter = { ...completionFilter };
                  newFilter[team.id] = (newFilter[team.id] + 1) % 3;
                  setCompletionFilter(newFilter);
                  e.stopPropagation();
                }}
              ></Button>
            </div>
          </>
        ),
        dataIndex: team.id.toString(),
        key: team.id.toString(),
        render: (finished: boolean) => (finished ? "✅" : "❌"),
        sorter: (a: any, b: any) => {
          return a[team.id] === b[team.id] ? 0 : a[team.id] ? -1 : 1;
        },
      }));
  }

  return (
    <>
      <Table
        columns={tableColumns}
        dataSource={tableRows.filter(applyFilter)}
        style={{ ...style }}
        showSorterTooltip={false}
        size="small"
        expandable={{
          expandRowByClick: true,
          expandIcon: () => null,
          expandedRowClassName: () => "expanded-row",
        }}
        rowClassName={(record) => (record.children ? "clickable" : "")}
        pagination={{ position: ["bottomRight"] }}
        {...tableProps}
      />
    </>
  );
}
