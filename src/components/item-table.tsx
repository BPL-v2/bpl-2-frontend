import { Table, theme } from "antd";
import { ColumnsType } from "antd/es/table";
import { ScoreCategory, ScoreObjective } from "../types/score";
import { getImage } from "../types/scoring-objective";
import { GlobalStateContext } from "../utils/context-provider";
import { useContext } from "react";
import { getAllObjectives } from "../utils/utils";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { red, green } from "@ant-design/colors";
import { BPLEvent } from "../types/event";

export type ItemTableProps = {
  category?: ScoreCategory;
  selectedTeam?: number;
  style?: React.CSSProperties;
};
const { useToken } = theme;

function imageOverlayedWithText(record: any) {
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
        src={record.img_location}
        style={{
          height: "100%",
          maxHeight: "60px",
          width: "auto",
        }}
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

export function ItemTable({ category, selectedTeam, style }: ItemTableProps) {
  const { currentEvent, isMobile } = useContext(GlobalStateContext);
  const token = useToken().token;
  if (!currentEvent || !category) {
    return <></>;
  }

  const variantMap = category.sub_categories
    .filter((subCategory) => subCategory.name.includes("Variants"))
    .reduce((acc: { [name: string]: ScoreObjective[] }, subCategory) => {
      const name = subCategory.name.split("Variants")[0].trim();
      acc[name] = subCategory.objectives;
      return acc;
    }, {});

  const tableRows = category.objectives.map((objective) => {
    const row = {
      key: objective.id,
      name: objective.extra ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{objective.name}</div>
          <span style={{ color: token.colorPrimary }}>[{objective.extra}]</span>
        </div>
      ) : (
        objective.name
      ),
      extra: objective.extra,
      img_location: getImage(objective),
      ...currentEvent.teams.reduce(
        (acc: { [teamId: number]: boolean }, team) => {
          acc[team.id] = objective.team_score[team.id].finished;
          return acc;
        },
        {}
      ),
    };
    if (variantMap[objective.name]) {
      row.name = (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{objective.name}</div>
          <span style={{ color: token.colorPrimary }}>
            [Click to toggle Variants]
          </span>
        </div>
      );
      // @ts-ignore - too lazy to fix it just works okay?!?!?
      row.children = variantMap[objective.name].map((variant) => {
        return {
          key: variant.id,
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
            render: (img_location: string | null) => {
              return img_location ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    maxHeight: "60px",
                  }}
                >
                  <img
                    src={img_location}
                    style={{
                      height: "100%",
                      maxHeight: "60px",
                      width: "auto",
                    }}
                  />
                </div>
              ) : (
                ""
              );
            },
            dataIndex: "img_location",
            key: "img_location",
            width: 120,
          },
        ]),
    {
      title: "Name",
      key: "name",
      render: (record: any) => {
        if (isMobile && !record.extra) {
          return imageOverlayedWithText(record);
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
                      {record[team.id] ? (
                        <CheckCircleFilled style={{ color: green[4] }} />
                      ) : (
                        <CloseCircleFilled style={{ color: red[4] }} />
                      )}
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
        title: team.name,
        dataIndex: team.id.toString(),
        key: team.id.toString(),
        render: (finished: boolean) =>
          finished ? (
            <CheckCircleFilled style={{ color: green[4] }} />
          ) : (
            <CloseCircleFilled style={{ color: red[4] }} />
          ),
        sorter: (a: any, b: any) => {
          return a[team.id] === b[team.id] ? 0 : a[team.id] ? -1 : 1;
        },
      }));
  }
  return (
    <Table
      columns={tableColumns}
      dataSource={tableRows}
      pagination={false}
      style={{ ...style }}
      showSorterTooltip={false}
      size="small"
      scroll={{ y: 600 }}
      expandable={{
        expandRowByClick: true,
        expandIcon: () => null,
        expandedRowClassName: () => "expanded-row",
      }}
      rowClassName={(record) => (record.children ? "clickable" : "")}
    />
  );
}
