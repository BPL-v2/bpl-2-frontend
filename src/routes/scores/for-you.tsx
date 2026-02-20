import { LadderEntry, ScoringMethod } from "@client/api";
import {
  preloadLadderData,
  useGetEventStatus,
  useGetLadder,
  useGetTeamGoals,
  useGetUser,
} from "@client/query";
import ProgressCard from "@components/cards/progress-card";
import { PoGauge } from "@components/personal-objective/po-gauge";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { flatMap } from "@utils/utils";
import { useContext, useMemo } from "react";

export const Route = createFileRoute("/scores/for-you")({
  component: ForYouTab,
  // @ts-ignore context is not typed
  loader: async ({ context: { queryClient } }) => {
    preloadLadderData(queryClient);
  },
});

function ForYouTab() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { user } = useGetUser();
  const { ladder } = useGetLadder(currentEvent.id);
  const { teamGoals = [] } = useGetTeamGoals(currentEvent.id);
  const teamGoalMap = teamGoals.reduce(
    (acc, goal) => {
      // @ts-ignore bad type in spec
      acc[goal.objective_id] = goal.extra;
      return acc;
    },
    {} as Record<number, string>,
  );
  // @ts-ignore not using this in bpl 17.5
  const personalObjectiveRender = useMemo(() => {
    let entry = ladder
      ?.sort((a, b) => b.level - a.level)
      .find((c) => c.user_id === user?.id);

    if (!entry) {
      entry = {
        level: 1,
        ascendancy_points: 0,
        atlas_points: 0,
        event_id: currentEvent.id,
      } as never as LadderEntry;
    }
    return (
      <div className="flex flex-col gap-2">
        <h2 className="mt-4">Personal Objectives</h2>
        <p>
          Help your team out by improving your character and earn up to 9 points
          for your team.
        </p>
        <div className="-mt-4 flex flex-col gap-1 text-base font-bold">
          <PoGauge
            descriptions={["Lvl 40", "Lvl 60", "Lvl 80"]}
            values={[
              entry.level >= 40 ? 1 : 0,
              entry.level >= 60 ? 1 : 0,
              entry.level >= 80 ? 1 : 0,
            ]}
            cap={3}
          ></PoGauge>
          <PoGauge
            descriptions={["Cruel Lab", "Merc Lab", "Uber Lab"]}
            values={[
              entry.ascendancy_points >= 4 ? 1 : 0,
              entry.ascendancy_points >= 6 ? 1 : 0,
              entry.ascendancy_points >= 8 ? 1 : 0,
            ]}
            cap={3}
          ></PoGauge>
          <PoGauge
            descriptions={["Lvl 90", "40 Atlas Points"]}
            values={[
              entry.level >= 90 ? 3 : 0,
              entry.atlas_points >= 40 ? 3 : 0,
            ]}
            cap={3}
          ></PoGauge>
        </div>
      </div>
    );
  }, [ladder, currentEvent.id, user?.id]);
  const teamId = eventStatus?.team_id as number;
  if (teamId === null || !eventStatus) {
    return (
      <div className="prose prose-xl flex max-w-full flex-col px-4 text-left 2xl:px-0">
        You have not been assigned to a team yet.
      </div>
    );
  }

  const objectives = flatMap(scores);
  const relevantCategories = objectives
    .filter(
      (category) =>
        category.scoring_presets[0]?.scoring_method ===
          ScoringMethod.RANKED_COMPLETION_TIME &&
        eventStatus.team_id !== undefined &&
        !category.team_score[eventStatus.team_id].isFinished(),
    )
    .sort((a, b) => {
      return (
        a.children.filter(
          (objective) => !objective.team_score[teamId].isFinished(),
        ).length /
          a.children.length -
        b.children.filter(
          (objective) => !objective.team_score[teamId].isFinished(),
        ).length /
          b.children.length
      );
    });

  const relevantObjectives = objectives
    .filter(
      (objective) =>
        objective.scoring_presets[0]?.scoring_method ===
          ScoringMethod.RANKED_TIME &&
        !objective.team_score[eventStatus.team_id!].isFinished() &&
        (!objective.valid_from || new Date(objective.valid_from) < new Date()),
    )
    .sort((a, b) => {
      return (
        b.team_score[teamId].number() / b.required_number -
        a.team_score[teamId].number() / a.required_number
      );
    });
  let suggestionsExist = false;
  for (const entry of Object.entries(teamGoalMap)) {
    if (entry[0] != String(scores?.id)) {
      suggestionsExist = true;
      break;
    }
  }
  return (
    <div className="prose prose-lg flex max-w-full flex-col px-4 text-left 2xl:px-0">
      {/* {personalObjectiveRender} */}
      {teamGoals && (
        <div>
          {scores && teamGoalMap[scores.id] && (
            <>
              <h3 className="flex items-center gap-2">
                <EnvelopeIcon className="size-8" /> Your team leads have left a
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {relevantCategories
                  .filter((category) => teamGoalMap[category.id] != undefined)
                  .map((category) => (
                    <ProgressCard key={category.id} category={category} />
                  ))}
                {relevantObjectives
                  .filter((obj) => teamGoalMap[obj.id] != undefined)
                  .map((obj) => (
                    <ProgressCard key={obj.id} category={obj} />
                  ))}
              </div>
            </>
          )}
        </div>
      )}
      <div>
        <h3>{teamGoals ? "Remaining Objectives" : "To do"}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relevantCategories
            .filter((category) => teamGoalMap[category.id] == undefined)
            .map((category) => (
              <ProgressCard key={category.id} category={category} />
            ))}
          {relevantObjectives
            .filter((obj) => teamGoalMap[obj.id] == undefined)
            .map((obj) => (
              <ProgressCard key={obj.id} category={obj} />
            ))}
        </div>
      </div>
    </div>
  );
}
