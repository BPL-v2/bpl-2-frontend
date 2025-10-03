import { GameVersion, LadderEntry, Score, Team } from "@client/api";
import { preloadLadderData, useGetLadder, useGetUsers } from "@client/query";
import { AscendancyName } from "@components/ascendancy-name";
import { AscendancyPortrait } from "@components/ascendancy-portrait";
import { CollectionCardTable } from "@components/collection-card-table";
import { ExperienceBar } from "@components/experience-bar";
import { LadderPortrait } from "@components/ladder-portrait";
import { ObjectiveIcon } from "@components/objective-icon";
import { Ranking } from "@components/ranking";
import Table from "@components/table";
import { TeamName } from "@components/team-name";
import TeamScoreDisplay from "@components/team-score";
import { ascendancies } from "@mytypes/ascendancy";
import { ScoreObjective, TeamScore } from "@mytypes/score";
import { DelveTabRules } from "@rules/delve";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef, sortingFns } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { JSX, useContext, useMemo } from "react";

export const Route = createFileRoute("/scores/delve")({
  component: DelveTab,
  // @ts-ignore context is not typed
  loader: async ({ context: { queryClient } }) => {
    preloadLadderData(queryClient);
  },
});

function DelveTab(): JSX.Element {
  const { scores, currentEvent, isMobile } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const { data: ladder = [] } = useGetLadder(currentEvent.id);
  const { data: users } = useGetUsers(currentEvent.id);
  const category = scores?.children.find((c) => c.name === "Delve");
  const teamMap = useMemo(
    () =>
      currentEvent?.teams?.reduce((acc: { [teamId: number]: Team }, team) => {
        acc[team.id] = team;
        return acc;
      }, {}) || {},
    [currentEvent],
  );
  const getTeam = useMemo(() => {
    const userToTeam =
      users?.reduce(
        (acc, user) => {
          acc[user.id] = teamMap[user.team_id];
          return acc;
        },
        {} as { [userId: number]: Team },
      ) || {};
    return (userId: number | undefined): Team | undefined => {
      if (userId === undefined) {
        return undefined;
      }
      return userToTeam[userId];
    };
  }, [users, teamMap]);
  const delveLadderColumns = useMemo(() => {
    if (!currentEvent) {
      return [];
    }
    let columns: ColumnDef<LadderEntry>[] = [];
    if (!isMobile) {
      columns = [
        {
          accessorKey: "delve",
          header: "Depth",
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
        },
        {
          accessorFn: (row) => getTeam(row.user_id),
          header: " ",
          cell: (info) => (
            <TeamName team={getTeam(info.row.original.user_id)} />
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
                className="h-8 w-8 rounded-full object-cover"
              />
              <AscendancyName
                character_class={info.row.original.character_class}
              />
            </div>
          ),
          size: 250,
          filterFn: "includesString",
          enableSorting: false,
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Ascendancy",
            options: Object.keys(ascendancies[GameVersion.poe1]),
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
      ];
    } else {
      columns = [
        {
          accessorKey: "delve",
          header: "Depth",
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
              team={getTeam(info.row.original.user_id)}
            />
          ),
        },
      ];
    }
    return columns;
  }, [isMobile, currentEvent, getTeam]);

  if (!category) {
    return <></>;
  }
  const fossilRaceCategory = category.children.find(
    (c) => c.name === "Fossil Race",
  );
  const culmulativeDepthTotal = category.children.find(
    (o) => o.name === "Culmulative Depth",
  );

  const culmulativeDepthRace = category.children.find(
    (o) => o.name === "Culmulative Depth Race",
  );

  const culmulativeDepthObj = {
    team_score: {} as TeamScore,
  } as ScoreObjective;

  for (const teamId in category.team_score) {
    const score = {} as Score;
    score.number = culmulativeDepthTotal?.team_score[teamId].number || 0;
    score.rank = culmulativeDepthRace?.team_score[teamId].rank || 0;

    score.finished = culmulativeDepthRace?.team_score[teamId].finished || false;
    score.points =
      (culmulativeDepthTotal?.team_score[teamId].points || 0) +
      (culmulativeDepthRace?.team_score[teamId].points || 0);
    score.timestamp =
      (culmulativeDepthTotal?.team_score[teamId].timestamp ||
        new Date().getTime() / 1000) * 1000;
    score.user_id = culmulativeDepthTotal?.team_score[teamId].user_id || 0;
    culmulativeDepthObj.team_score[teamId] = score;
  }
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <DelveTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-8">
        <TeamScoreDisplay objective={category} />
        {fossilRaceCategory ? (
          <div className="rounded-box bg-base-200 p-8 pt-2">
            <div className="divider divider-primary">Fossil Race</div>
            <Ranking
              objective={fossilRaceCategory}
              description="Fossils:"
              actual={(teamId) =>
                fossilRaceCategory.children.reduce(
                  (acc, objective) =>
                    acc +
                    Math.min(
                      objective.team_score[teamId].number,
                      objective.required_number,
                    ),
                  0,
                )
              }
              maximum={fossilRaceCategory.children.reduce(
                (acc, objective) => acc + objective.required_number,
                0,
              )}
            />
            <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fossilRaceCategory.children.map((objective) => {
                return (
                  <div className="card bg-base-300" key={objective.id}>
                    <div className="m-0 flex rounded-t-box bg-base-100 p-2 px-4">
                      <ObjectiveIcon
                        objective={objective}
                        gameVersion={currentEvent.game_version}
                        className="h-8 w-8"
                      />

                      <h3 className="mx-4 flex-grow text-center text-xl font-semibold">
                        {objective.name}
                      </h3>
                    </div>
                    <div className="rounded-b-box">
                      <CollectionCardTable objective={objective} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {culmulativeDepthTotal && culmulativeDepthRace ? (
          <div className="rounded-box bg-base-200 p-8 pt-2">
            <div className="divider divider-primary">
              {"Culmulative Team Depth"}
            </div>
            <div className="flex flex-col gap-4">
              <Ranking
                objective={culmulativeDepthObj}
                maximum={culmulativeDepthRace.required_number}
                actual={(teamId: number) =>
                  culmulativeDepthObj.team_score[teamId].number
                }
                description="Depth:"
              />
              <Table
                columns={delveLadderColumns}
                data={ladder?.sort((a, b) => b.delve - a.delve)}
                className="h-[70vh]"
                styles={{
                  header: "bg-base-100",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
