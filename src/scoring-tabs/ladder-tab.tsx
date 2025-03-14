import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { getTotalPoints } from "../utils/utils";
import { Team } from "../client";
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
  const { scores, currentEvent, isMobile } = useContext(GlobalStateContext);

  if (!scores || !currentEvent || !currentEvent.teams) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );
  // const userToTeam = users.reduce((acc, user) => {
  //   acc[user.id] = teamMap[user.team_id]?.name;
  //   return acc;
  // }, {} as { [userId: number]: string });
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
  const scoreColumns: any[] = [
    {
      title: "Team",
      dataIndex: ["team", "name"],
      render: (row: any) => row.team?.name,
      key: "team",
    },
    {
      title: "Total",
      dataIndex: "default",
      key: "default",
      defaultSortOrder: "descend",
    },
    ...getCompletionColumns(isMobile),
  ];

  // const ladderColumns: ColumnType<LadderEntry>[] = [
  //   {
  //     title: "Rank",
  //     dataIndex: "rank",
  //     key: "rank",
  //     sorter: (a: LadderEntry, b: LadderEntry) => a.rank - b.rank,
  //     defaultSortOrder: "ascend",
  //   },
  //   {
  //     title: "Character",
  //     dataIndex: "character_name",
  //     key: "character_name",
  //     sorter: (a: LadderEntry, b: LadderEntry) =>
  //       a.character_name.localeCompare(b.character_name),
  //   },
  //   {
  //     title: "Account",
  //     dataIndex: "account_name",
  //     key: "account_name",
  //     sorter: (a: LadderEntry, b: LadderEntry) =>
  //       a.account_name.localeCompare(b.account_name),
  //   },
  //   {
  //     title: "Ascendancy",
  //     dataIndex: "character_class",
  //     key: "character_class",
  //     sorter: (a: LadderEntry, b: LadderEntry) =>
  //       a.character_class.localeCompare(b.character_class),
  //     render: (character_class: string) => {
  //       const classObj =
  //         ascendancies["poe1"][
  //           phreciaMapping[character_class as keyof typeof phreciaMapping]
  //         ];
  //       if (!classObj) {
  //         return character_class;
  //       }
  //       return (
  //         // <div className="flex items-center gap-2">
  //         //   <img
  //         //     src={classObj.thumbnail}
  //         //     alt={character_class}
  //         //     className="w-8 h-8"
  //         //   />
  //         <p className="font-semibold" style={{ color: classObj.classColor }}>
  //           {character_class}
  //         </p>
  //         // </div>
  //       );
  //     },
  //   },
  //   {
  //     title: "Level",
  //     key: "level",
  //     sorter: (a: LadderEntry, b: LadderEntry) => a.level - b.level,
  //     render: (record: LadderEntry) => (
  //       <div className="w-[100px]">
  //         {record.level}
  //         <div className="w-full ">
  //           <Progress
  //             strokeColor={{
  //               "0%": "#2196f3",
  //               "100%": "#1e88e5",
  //             }}
  //             percent={getLevelProgress(record.experience, record.level)}
  //             showInfo={false}
  //           ></Progress>
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Delve",
  //     dataIndex: "delve",
  //     key: "delve",
  //     sorter: (a: LadderEntry, b: LadderEntry) => a.delve - b.delve,
  //   },
  //   {
  //     title: "Team",
  //     key: "team",
  //     render: (record: LadderEntry) => userToTeam[record.user_id],
  //   },
  // ];
  function getCompletionColumns(isMobile: boolean) {
    if (isMobile) {
      return [
        {
          title: "Categories",
          render: (record: RowDef) => {
            return (
              <>
                <div className="flex flex-wrap gap-2">
                  {categoryNames.map((categoryName) => {
                    return (
                      <div
                        key={`badge-${categoryName}`}
                        className="badge badge-primary badge-lg"
                      >
                        {/* @ts-ignore */}
                        {`${categoryName} ${record[categoryName]}`}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          },
        },
      ];
    }
    return categoryNames.map((categoryName) => ({
      title: categoryName,
      dataIndex: categoryName,
      key: `column-${categoryName}`,
      sorter: (a: any, b: any) => a[categoryName] - b[categoryName],
    }));
  }
  return (
    <>
      <div className="divider divider-primary ">{"Team Scores"}</div>
      <table className="table bg-base-300 text-lg">
        <thead className="bg-base-200">
          <tr>
            {scoreColumns.map((column) => (
              <th key={`header-${column.key}`}>
                {
                  // @ts-ignore
                  column.title
                }
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="">
              {scoreColumns.map((column) => (
                <td key={`column-${column.key}`}>
                  {
                    // @ts-ignore
                    column.render ? column.render(row) : row[column.dataIndex]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider divider-primary">{"Ladder"}</div>
      {/* <Table
        columns={ladderColumns}
        dataSource={ladder.map((entry, index) => ({
          ...entry,
          key: "ladder-" + index,
        }))}
        // pagination={false}
        size="small"
        rowKey="key"
      /> */}
    </>
  );
}
