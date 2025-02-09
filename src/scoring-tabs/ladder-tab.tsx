import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { Team } from "../types/team";
import { getTotalPoints } from "../utils/utils";

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
  const columns: any[] = [
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
            {columns.map((column) => (
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
              {columns.map((column) => (
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
    </>
  );
}
