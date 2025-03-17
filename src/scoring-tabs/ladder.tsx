import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { getTotalPoints } from "../utils/utils";
import { LadderEntry, Team } from "../client";
import { ColumnDef } from "@tanstack/react-table";

import { Table } from "../components/table";
import { Ascendancy } from "../components/ascendancy";
import { ExperienceBar } from "../components/experience-bar";
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
      acc[user.id] = teamMap[user.team_id]?.name;
      return acc;
    }, {} as { [userId: number]: string }) || {};

  const ladderColumns: ColumnDef<LadderEntry, any>[] = [
    {
      accessorKey: "rank",
      header: "Rank",
      size: 60,
    },
    {
      accessorKey: "character_name",
      header: "Character",
      size: 250,
    },
    {
      accessorKey: "account_name",
      header: "Account",
      size: 180,
    },
    {
      accessorFn: (row) => userToTeam[row.user_id] || "Cartographers",
      header: "Team",
      size: 120,
    },
    {
      accessorKey: "character_class",
      header: "Ascendancy",
      cell: (info) => (
        <Ascendancy character_class={info.row.original.character_class} />
      ),
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
      size: 80,
    },
    {
      accessorKey: "delve",
      header: "Delve",
    },
  ];
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

      <div className="divider divider-primary">{"Ladder"}</div>
      <Table
        data={ladder}
        columns={ladderColumns}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </>
  );
}
