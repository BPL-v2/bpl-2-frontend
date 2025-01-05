import { Table, Image } from "antd";
import { ColumnsType } from "antd/es/table";
import { ScoreCategory } from "../types/score";
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

export function ItemTable({ category, selectedTeam, style }: ItemTableProps) {
  const { currentEvent, isMobile } = useContext(GlobalStateContext);
  if (!currentEvent || !category) {
    return <></>;
  }
  const tableRows = getAllObjectives(category).map((objective) => ({
    key: objective.id,
    name: objective.name,
    img_location: getImage(objective),
    ...currentEvent.teams.reduce((acc: { [teamId: number]: boolean }, team) => {
      acc[team.id] = objective.team_score[team.id].finished;
      return acc;
    }, {}),
  }));
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
                  <Image
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
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
                      <span style={{ marginRight: "8px" }}>{team.name}</span>
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
    />
  );
}
