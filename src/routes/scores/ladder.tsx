import { useContext, useMemo } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { getRootCategoryNames } from "@mytypes/scoring-category";
import { getTotalPoints } from "@utils/utils";
import { GameVersion, LadderEntry, Team } from "@client/api";
import { ColumnDef, sortingFns } from "@tanstack/react-table";

import { Ascendancy } from "@components/ascendancy";
import { ExperienceBar } from "@components/experience-bar";
import { TeamName } from "@components/team-name";
import { LadderPortrait } from "@components/ladder-portrait";
import { AscendancyPortrait } from "@components/ascendancy-portrait";
import Table from "@components/table";
import { phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { calcPersonalPoints } from "@utils/personal-points";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ruleWrapper } from "./route";
import { POPointRules } from "@rules/po-points";
import POProgressBar from "@components/po-progress";
type RowDef = {
  default: number;
  team: Team;
  key: string;
  "Personal Objectives": number;
  Collections: number;
  Uniques: number;
  Bounties: number;
  Races: number;
  Dailies: number;
};

export const Route = createFileRoute("/scores/ladder")({
  component: () => ruleWrapper(LadderTab(), POPointRules()),
});

export function LadderTab() {
  const { scores, currentEvent, isMobile, users, ladder, gameVersion } =
    useContext(GlobalStateContext);
  const teamMap =
    currentEvent?.teams?.reduce((acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    }, {}) || {};
  const userToTeam =
    users?.reduce(
      (acc, user) => {
        acc[user.id] = teamMap[user.team_id];
        return acc;
      },
      {} as { [userId: number]: Team }
    ) || {};

  const ladderColumns = useMemo(() => {
    if (!currentEvent) {
      return [];
    }
    let columns: ColumnDef<LadderEntry, any>[] = [];
    if (!isMobile) {
      columns = [
        {
          accessorKey: "rank",
          header: "Rank",
          sortingFn: sortingFns.basic,
          size: 100,
        },
        {
          accessorKey: "character_name",
          header: "",
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Character",
          },
          cell: (info) => (
            <a
              className="cursor-pointer"
              target="_blank"
              rel="noreferrer"
              href={`https://www.pathofexile.com/account/view-profile/${info.row.original.account_name.replace(
                "#",
                "-"
              )}/characters?characterName=${info.row.original.character_name}`}
            >
              {info.row.original.character_name}
            </a>
          ),
        },
        {
          accessorKey: "account_name",
          header: "",
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Account",
          },
          cell: (info) => {
            const accountName = info.getValue<string>();
            return info.row.original.user_id ? (
              <Link
                to={`/profile/$userId`}
                params={{ userId: info.row.original.user_id }}
                rel="noopener noreferrer"
              >
                {accountName}
              </Link>
            ) : (
              accountName
            );
          },
        },
        {
          accessorFn: (row) => userToTeam[row.user_id]?.name,
          header: " ",
          cell: (info) => (
            <TeamName team={userToTeam[info.row.original.user_id]} />
          ),
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Team",
            options: currentEvent.teams.map((team) => team.name),
          },
        },
        {
          accessorKey: "character_class",
          header: "",
          cell: (info) => (
            <div className="flex items-center gap-2">
              <AscendancyPortrait
                character_class={info.row.original.character_class}
                className="w-8 h-8 rounded-full"
              />
              <Ascendancy character_class={info.row.original.character_class} />
            </div>
          ),
          size: 250,
          filterFn: "includesString",
          enableSorting: false,
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Ascendancy",
            options:
              gameVersion === GameVersion.poe1
                ? Object.keys(phreciaMapping)
                : Object.entries(poe2Mapping).map(([key, value]) => ({
                    label: value,
                    value: key,
                  })),
          },
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
          size: 150,
        },
        {
          accessorFn: (row) => calcPersonalPoints(row),
          header: "PO Points",
          sortingFn: sortingFns.basic,
          size: 100,
        },
      ];
    } else {
      columns = [
        {
          accessorKey: "rank",
          header: "Rank",
          sortingFn: sortingFns.basic,
          size: 100,
        },
        {
          accessorFn: (row) =>
            row.account_name + row.character_name + row.character_class,
          header: " ",
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Character",
          },
          cell: (info) => (
            <LadderPortrait
              entry={info.row.original}
              teamName={userToTeam[info.row.original.user_id]?.name}
            />
          ),
        },
      ];
    }
    return columns;
  }, [isMobile, currentEvent]);

  if (!scores || !currentEvent || !currentEvent.teams) {
    return <></>;
  }
  const categoryNames = getRootCategoryNames(currentEvent.game_version);
  const categories = scores.sub_categories.filter((category) =>
    categoryNames.includes(category.name)
  );
  categories.push(scores);
  const points = categories.reduce(
    (acc, category) => {
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
    },
    {} as { [teamId: number]: { [categoryName: string]: number } }
  );
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
  const objs = scores?.sub_categories.find(
    (category) => category.name === "Personal Objectives"
  )?.objectives;
  const totalObjective = objs?.find(
    (obj) => obj.scoring_preset?.point_cap || 0 > 0
  );
  const checkPoints = objs?.filter((obj) => !obj.scoring_preset?.point_cap);
  return (
    <>
      <div className="divider divider-primary ">Team Scores</div>
      <table className="table bg-base-300 text-lg">
        <thead className="bg-base-200">
          <tr>
            {scoreColumns.map((column) => (
              <th key={`header-${column.key}`}>{column.title}</th>
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
      <div className="divider divider-primary">Personal Objective Points</div>
      {totalObjective && checkPoints && (
        <div className="card bg-base-300">
          <div className="card-body">
            <div className="flex flex-col gap-4">
              {currentEvent.teams.map((team) => {
                const values = [];
                const extra = [];
                let total = 0;
                for (const obj of checkPoints) {
                  const teamScore = obj.team_score[team.id];
                  if (!teamScore || !teamScore.points) {
                    continue;
                  }
                  const number = teamScore.number;
                  total += teamScore.points;
                  values.push(number);
                  extra.push(teamScore.points);
                }
                const cap = totalObjective?.scoring_preset?.point_cap || 0;
                const current = Math.min(
                  totalObjective?.team_score[team.id]?.number || 0,
                  cap
                );
                total += current;
                return (
                  <div className="flex flex-row gap-2" key={team.id}>
                    <div className="flex flex-row justify-between w-40 text-lg">
                      <TeamName className="font-semibold" team={team} />
                      <div>{total}</div>
                    </div>
                    <POProgressBar
                      checkpoints={values}
                      extra={extra}
                      max={cap}
                      current={current}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="divider divider-primary">Ladder</div>
      <Table
        data={ladder.sort((a, b) => a.rank - b.rank)}
        columns={ladderColumns}
        className="h-[70vh]"
      />
    </>
  );
}
