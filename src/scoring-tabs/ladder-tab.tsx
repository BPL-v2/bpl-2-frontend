import { Divider, Table, theme } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";
import { getTotalPoints } from "../utils/utils";
import { ColumnsType } from "antd/es/table";

type RowDef = {
  default: number;
  team: Team;
  key: string;
  Collections: number;
  Uniques: number;
  Bounties: number;
  Races: number;
};
const { useToken } = theme;

export function LadderTab() {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const token = useToken().token;
  if (!scores || !currentEvent) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );
  const categoryNames = ["Collections", "Uniques", "Bounties", "Races"];
  const categories = categoryNames.map((categoryName) =>
    getSubCategory(scores, categoryName)
  );
  categories.push(scores);

  const points = categories.reduce((acc, category) => {
    if (!category) {
      return acc;
    }
    const points = getTotalPoints(category);
    for (const [teamId, teamPoints] of Object.entries(points)) {
      const id = parseInt(teamId);
      if (!acc[id]) {
        acc[id] = {};
      }
      acc[id][category.name] = teamPoints;
    }
    return acc;
  }, {} as { [teamId: number]: { [categoryName: string]: number } });

  const rows = Object.entries(points).map(([teamId, teamPoints]) => {
    return {
      team: teamMap[parseInt(teamId)],
      key: teamId,
      ...teamPoints,
    } as RowDef;
  });
  const columns: ColumnsType<RowDef> = [
    {
      title: "Team",
      dataIndex: ["team", "name"],
      key: "team",
      sorter: (a, b) => a.team.name.localeCompare(b.team.name),
    },
    {
      title: "Total",
      dataIndex: "default",
      key: "default",
      sorter: (a, b) => a.default - b.default,
      defaultSortOrder: "descend",
    },
    ...categoryNames.map((categoryName) => ({
      title: categoryName,
      dataIndex: categoryName,
      key: categoryName,
      sorter: (a: any, b: any) => a[categoryName] - b[categoryName],
    })),
  ];

  return (
    <>
      <Divider style={{ borderColor: token.colorPrimary }}>
        {`Team Scores`}
      </Divider>
      <Table
        dataSource={rows}
        columns={columns}
        rowClassName={(record) =>
          record.team.id === eventStatus?.team_id ? "table-row-light" : ""
        }
        pagination={false}
        size="small"
        showSorterTooltip={false}
      />
      <Divider style={{ borderColor: token.colorPrimary }}>{`Ladder`}</Divider>
    </>
  );
}
