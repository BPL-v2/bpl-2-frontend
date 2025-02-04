import { Divider, Flex, Table, Tag } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { Team } from "../types/team";
import { getTotalPoints } from "../utils/utils";
import { ColumnsType } from "antd/es/table";
import { cyanDark } from "@ant-design/colors";

type RowDef = {
  default: number;
  team: Team;
  key: string;
  Collections: number;
  Uniques: number;
  Bounties: number;
  Races: number;
  Dailies: number;
};

export function LadderTab() {
  const { eventStatus, scores, currentEvent, isMobile } =
    useContext(GlobalStateContext);
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
  const categoryNames = getRootCategoryNames(currentEvent.game_version);
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
    ...getCompletionColumns(isMobile),
  ];
  function getCompletionColumns(isMobile: boolean) {
    if (isMobile) {
      return [
        {
          title: "Categories",
          render: (record: RowDef) => {
            return (
              <>
                <Flex wrap="wrap" gap="4px">
                  {categoryNames.map((categoryName, idx) => {
                    return (
                      <Tag key={categoryName} color={cyanDark[1 + (idx % 4)]}>
                        {/* @ts-ignore */}
                        {`${categoryName} ${record[categoryName]}`}
                      </Tag>
                    );
                  })}
                </Flex>
              </>
            );
          },
        },
      ];
    }
    return categoryNames.map((categoryName) => ({
      title: categoryName,
      dataIndex: categoryName,
      key: categoryName,
      sorter: (a: any, b: any) => a[categoryName] - b[categoryName],
    }));
  }
  return (
    <>
      <Divider>{`Team Scores`}</Divider>
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
      <Divider>{`Ladder`}</Divider>
    </>
  );
}
