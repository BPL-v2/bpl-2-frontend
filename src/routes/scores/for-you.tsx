import { Character, ScoringMethod } from "@client/api";
import {
  preloadLadderData,
  useGetEventStatus,
  useGetLadder,
  useGetTeamGoals,
  useGetUser,
} from "@client/query";
import { PoGauge } from "@components/po-gauge";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { ScoreObjective } from "@mytypes/score";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { flatMap } from "@utils/utils";
import { useContext, useMemo } from "react";

export const Route = createFileRoute("/scores/for-you")({
  component: ForYouTab,
  // @ts-ignore
  loader: async ({ context: { queryClient } }) => {
    preloadLadderData(queryClient);
  },
});

export function ForYouTab() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { user } = useGetUser();
  const { ladder } = useGetLadder(101);
  const { teamGoals = [] } = useGetTeamGoals(currentEvent.id);
  const teamGoalMap = teamGoals.reduce(
    (acc, goal) => {
      // @ts-ignore bad type in spec
      acc[goal.objective_id] = goal.extra;
      return acc;
    },
    {} as Record<number, string>
  );

  const personalObjectiveRender = useMemo(() => {
    let char = ladder
      ?.sort((a, b) => b.level - a.level)
      .find((c) => c.user_id === user?.id)?.character;

    if (!char) {
      char = {
        level: 1,
        ascendancy_points: 0,
        atlas_node_count: 0,
        event_id: currentEvent.id,
      } as Character;
    }
    return (
      <div className="flex flex-col gap-2">
        <h2 className="mt-4">Personal Objectives</h2>
        <p>
          Help your team out by improving your character and earn up to 9 points
          for your team.
        </p>
        <div className="flex flex-col gap-1 text-base font-bold mt-[-1rem]">
          <PoGauge
            descriptions={["Lvl 40", "Lvl 60", "Lvl 80"]}
            values={[
              char.level >= 40 ? 1 : 0,
              char.level >= 60 ? 1 : 0,
              char.level >= 80 ? 1 : 0,
            ]}
            cap={3}
          ></PoGauge>
          <PoGauge
            descriptions={["Cruel Lab", "Merc Lab", "Uber Lab"]}
            values={[
              char.ascendancy_points >= 4 ? 1 : 0,
              char.ascendancy_points >= 6 ? 1 : 0,
              char.ascendancy_points >= 8 ? 1 : 0,
            ]}
            cap={3}
          ></PoGauge>
          <PoGauge
            descriptions={["Lvl 90", "40 Atlas Points"]}
            values={[
              char.level >= 90 ? 3 : 0,
              char.atlas_node_count >= 40 ? 3 : 0,
            ]}
            cap={3}
          ></PoGauge>
        </div>
      </div>
    );
  }, [ladder]);
  const teamId = eventStatus?.team_id as number;
  if (teamId === null || !eventStatus) {
    return (
      <div className="prose prose-xl text-left max-w-full flex flex-col px-4 2xl:px-0">
        You have not been assigned to a team yet.
      </div>
    );
  }

  const objectives = flatMap(scores);
  const relevantCategories = objectives
    .filter(
      (category) =>
        category.scoring_preset?.scoring_method ===
          ScoringMethod.RANKED_COMPLETION_TIME &&
        eventStatus.team_id !== undefined &&
        !category.team_score[eventStatus.team_id]?.finished
    )
    .sort((a, b) => {
      return (
        a.children.filter(
          (objective) => !objective.team_score[teamId]?.finished
        ).length /
          a.children.length -
        b.children.filter(
          (objective) => !objective.team_score[teamId]?.finished
        ).length /
          b.children.length
      );
    });

  const relevantObjectives = objectives.filter(
    (objective) =>
      objective.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME &&
      !objective.team_score[eventStatus.team_id!]?.finished &&
      (!objective.valid_from || new Date(objective.valid_from) < new Date())
  );
  function categoryRender(
    category: ScoreObjective,
    teamGoalMap: Record<number, string>
  ) {
    const childLeaves = category.children.filter(
      (obj) => obj.children.length === 0
    );
    const totalObjectives = childLeaves.length;
    const unfinishedObjectives = childLeaves.filter(
      (obj) => !obj.team_score[teamId]?.finished
    );
    const teamLeadMessage = teamGoalMap[category.id];
    return (
      <div className="card bg-base-300" key={category.id}>
        <div className="card-body flex-row gap-1">
          <div tabIndex={0} className="collapse bg-base-200 items-start">
            <div className="card-title collapse-title flex justify-between text-lg pe-px-4 px-4">
              <div>{category.name}</div>
              <div className="text-primary whitespace-nowrap">
                {totalObjectives - unfinishedObjectives.length} /{" "}
                {totalObjectives}
              </div>
            </div>
            <ul className="collapse-content list not-prose">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                Missing Items
              </li>
              {unfinishedObjectives.map((obj) => (
                <li className="list-row" key={obj.id}>
                  {obj.name}
                </li>
              ))}
            </ul>
          </div>
          {teamLeadMessage && (
            <div className="tooltip">
              <div className="tooltip-content text-lg text-error whitespace-pre-wrap text-left p-4">
                {teamLeadMessage}
              </div>
              <EnvelopeIcon className="h-6 w-6 text-error cursor-help"></EnvelopeIcon>
            </div>
          )}
        </div>
        <progress
          className="progress progress-primary w-full rounded-b-box rounded-t-none"
          value={totalObjectives - unfinishedObjectives.length}
          max={totalObjectives}
        ></progress>
      </div>
    );
  }

  function objRender(obj: ScoreObjective, teamGoalMap: Record<number, string>) {
    const teamLeadMessage = teamGoalMap[obj.id];
    return (
      <div className="card bg-base-300" key={obj.id}>
        <div className="card-body flex-row gap-1">
          <div className="card-title flex justify-between text-lg">
            <div>{obj.name}</div>
            <div className="text-primary whitespace-nowrap">
              {obj.team_score[teamId]?.number} / {obj.required_number}
            </div>
          </div>
          {teamLeadMessage && (
            <div className="tooltip">
              <div className="tooltip-content text-lg text-error whitespace-pre-wrap text-left p-4">
                {teamLeadMessage}
              </div>
              <EnvelopeIcon className="h-6 w-6 text-error cursor-help"></EnvelopeIcon>
            </div>
          )}
        </div>
        <progress
          className="progress progress-primary w-full rounded-b-box rounded-t-none"
          value={obj.team_score[teamId]?.number}
          max={obj.required_number}
        ></progress>
      </div>
    );
  }
  let suggestionsExist = false;
  for (const entry of Object.entries(teamGoalMap)) {
    if (entry[0] != String(scores?.id)) {
      suggestionsExist = true;
      break;
    }
  }
  return (
    <div className="prose prose-lg text-left max-w-full flex flex-col px-4 2xl:px-0">
      {personalObjectiveRender}
      {teamGoals && (
        <div>
          {scores && teamGoalMap[scores.id] && (
            <>
              <h3 className="flex items-center gap-2">
                <EnvelopeIcon className="h-8 w-8" /> Your team leads have left a
                message for you:
              </h3>
              <p className="whitespace-pre-wrap text-info">
                {teamGoalMap[scores.id]}
              </p>
            </>
          )}
          {suggestionsExist && (
            <>
              <h3>
                Your team leads have selected objectives that are urgent for you
                to do.
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {relevantCategories
                  .filter((category) => teamGoalMap[category.id] != undefined)
                  .map((category) => categoryRender(category, teamGoalMap))}
                {relevantObjectives
                  .filter((obj) => teamGoalMap[obj.id] != undefined)
                  .map((obj) => objRender(obj, teamGoalMap))}
              </div>
            </>
          )}
        </div>
      )}
      <div>
        <h3>{teamGoals ? "Remaining Objectives" : "To do"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {relevantCategories
            .filter((category) => teamGoalMap[category.id] == undefined)
            .map((category) => categoryRender(category, teamGoalMap))}
          {relevantObjectives
            .filter((obj) => teamGoalMap[obj.id] == undefined)
            .map((obj) => objRender(obj, teamGoalMap))}
        </div>
      </div>
    </div>
  );
}
