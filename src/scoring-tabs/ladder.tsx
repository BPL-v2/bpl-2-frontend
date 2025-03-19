import { useContext, useMemo } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { getTotalPoints } from "../utils/utils";
import { LadderEntry, Team } from "../client";
import { ColumnDef, sortingFns } from "@tanstack/react-table";

import { Table } from "../components/table";
import { Ascendancy } from "../components/ascendancy";
import { ExperienceBar } from "../components/experience-bar";
import { TeamName } from "../components/team-name";
import { LadderPortrait } from "../components/ladder-portrait";
import { AscendancyPortrait } from "../components/ascendancy-portrait";
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
  const { scores, currentEvent, isMobile, users, ladder } =
    useContext(GlobalStateContext);
  const teamMap =
    currentEvent?.teams?.reduce((acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    }, {}) || {};
  const userToTeam =
    users?.reduce((acc, user) => {
      acc[user.id] = teamMap[user.team_id];
      return acc;
    }, {} as { [userId: number]: Team }) || {};

  const ladderColumns = useMemo(() => {
    let columns: ColumnDef<LadderEntry, any>[] = [];
    if (!isMobile) {
      columns = [
        {
          accessorKey: "rank",
          header: "Rank",
          sortingFn: sortingFns.basic,
          size: 60,
        },
        {
          accessorKey: "character_name",
          header: "Character",
          sortingFn: sortingFns.text,
          size: 250,
        },
        {
          accessorKey: "account_name",
          header: "Account",
          sortingFn: sortingFns.text,
          size: 180,
        },
        {
          accessorFn: (row) => userToTeam[row.user_id] || "Cartographers",
          header: "Team",
          cell: (info) => (
            <TeamName team={userToTeam[info.row.original.user_id]} />
          ),
          sortingFn: sortingFns.text,
          size: 120,
        },
        {
          accessorKey: "character_class",
          header: "Ascendancy",
          cell: (info) => (
            <div className="flex items-center gap-2">
              <AscendancyPortrait
                character_class={info.row.original.character_class}
                className="w-8 h-8 rounded-full"
              />
              <Ascendancy character_class={info.row.original.character_class} />
            </div>
          ),
          sortingFn: sortingFns.text,
          size: 200,
        },
        {
          accessorKey: "experience",
          header: "Level",
          cell: (info) => (
            <ExperienceBar
              experience={info.row.original.experience}
              level={info.row.original.level}
            />
          ),
          sortingFn: sortingFns.basic,

          size: 80,
        },
        {
          accessorKey: "delve",
          header: "Delve",
          sortingFn: sortingFns.basic,
        },
      ];
    } else {
      columns = [
        {
          accessorKey: "rank",
          header: "Rank",
          sortingFn: sortingFns.basic,
          size: 10,
        },
        {
          header: "Character",
          cell: (info) => (
            <LadderPortrait
              entry={info.row.original}
              teamName={userToTeam[info.row.original.user_id]?.name}
            />
          ),
          size: 400,
        },
      ];
    }
    return columns;
  }, [isMobile]);

  if (!scores || !currentEvent || !currentEvent.teams) {
    return <></>;
  }
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
      render: (row: any) => (
        <TeamName className="font-semibold" team={row.team} />
      ),
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

  function getCompletionColumns(isMobile: boolean) {
    if (isMobile) {
      return [
        // {
        //   title: "Categories",
        //   render: (record: RowDef) => {
        //     return (
        //       <>
        //         <div className="flex flex-wrap gap-2">
        //           {categoryNames.map((categoryName) => {
        //             return (
        //               <div
        //                 key={`badge-${categoryName}`}
        //                 className="badge badge-primary badge-lg"
        //               >
        //                 {/* @ts-ignore */}
        //                 {`${categoryName} ${record[categoryName]}`}
        //               </div>
        //             );
        //           })}
        //         </div>
        //       </>
        //     );
        //   },
        // },
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
      <div className="divider divider-primary ">Team Scores</div>
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
          {rows
            .sort((a, b) => b.default - a.default)
            .map((row) => (
              <tr key={row.key} className="hover:bg-base-200/50">
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

      <div className="divider divider-primary">Ladder</div>
      <Table
        data={ladder}
        columns={ladderColumns}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </>
  );
}
