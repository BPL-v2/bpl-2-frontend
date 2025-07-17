import { useContext, useMemo } from "react";
import { Character, ScoringMethod } from "@client/api";
import { GlobalStateContext } from "@utils/context-provider";
import { createFileRoute } from "@tanstack/react-router";
import { ScoreObjective } from "@mytypes/score";
import { flatMap } from "@utils/utils";
import {
  useGetEventStatus,
  useGetTeamGoals,
  useGetUser,
  useGetUserCharacters,
} from "@client/query";
import { PoGauge } from "@components/po-gauge";

export const Route = createFileRoute("/scores/for-you")({
  component: ForYouTab,
});

export function ForYouTab() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { user } = useGetUser();
  const { userCharacters } = useGetUserCharacters(user?.id ?? 0);
  const { teamGoals } = useGetTeamGoals(currentEvent.id);

  const personalObjectiveRender = useMemo(() => {
    let char = userCharacters
      ?.sort((a, b) => b.level - a.level)
      .find((c) => c.event_id === currentEvent.id);
    if (!char) {
      char = {
        level: 1,
        ascendancy_points: 0,
        atlas_node_count: 0,
        event_id: currentEvent.id,
      } as Character;
    }
    return (
      <div>
        <h2 className="mt-4">Personal Objectives</h2>
        <p>
          Help your team out by improving your character and earn up to 9 points
          for your team.
        </p>
        <div className="flex flex-col gap-2">
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
  }, [userCharacters]);
  if (!scores || !user) {
    return <div>Loading...</div>;
  }
  const teamId = eventStatus?.team_id as number;
  if (teamId === undefined || !eventStatus) {
    return;
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
  console.log("relevantObjectives", relevantObjectives);

  function categoryRender(category: ScoreObjective) {
    const childLeaves = category.children.filter(
      (obj) => obj.children.length === 0
    );
    const totalObjectives = childLeaves.length;
    const unfinishedObjectives = childLeaves.filter(
      (obj) => !obj.team_score[teamId]?.finished
    );
    return (
      <div className="card bg-base-300" key={category.id}>
        <div className="card-body">
          <div tabIndex={0} className="collapse bg-base-200 items-start">
            <div className="card-title collapse-title flex justify-between text-lg pe-px-4 px-4">
              <div>{category.name}</div>
              <div className="text-primary whitespace-nowrap">
                {totalObjectives - unfinishedObjectives.length} /{" "}
                {totalObjectives}
              </div>
            </div>
            <ul className="collapse-content list not-prose">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide ">
                Missing Items
              </li>
              {unfinishedObjectives.map((obj) => (
                <li className="list-row" key={obj.id}>
                  {obj.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <progress
          className="progress progress-primary w-full rounded-b-box rounded-t-none"
          value={totalObjectives - unfinishedObjectives.length}
          max={totalObjectives}
        ></progress>
      </div>
    );
  }

  function objRender(obj: ScoreObjective) {
    return (
      <div className="card bg-base-300" key={obj.id}>
        <div className="card-body">
          <div className="card-title flex justify-between text-lg">
            <div>{obj.name}</div>
            <div className="text-primary whitespace-nowrap">
              {obj.team_score[teamId]?.number} / {obj.required_number}
            </div>
          </div>
        </div>
        <progress
          className="progress progress-primary w-full rounded-b-box rounded-t-none"
          value={obj.team_score[teamId]?.number}
          max={obj.required_number}
        ></progress>
      </div>
    );
  }

  return (
    <div className="prose prose-xl text-left max-w-full flex flex-col px-4 2xl:px-0">
      {personalObjectiveRender}
      {teamGoals && (
        <div>
          <h2>Team lead suggestions</h2>
          <p>
            Your team leads have selected objectives that are urgent for you to
            do.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {relevantCategories
              .filter((category) => teamGoals?.includes(category.id))
              .map(categoryRender)}
            {relevantObjectives
              .filter((obj) => teamGoals?.includes(obj.id))
              .map(objRender)}
          </div>
        </div>
      )}
      <div>
        <h2>{teamGoals ? "Remaining" : "To do"}</h2>
        <p>Other objectives that are time sensitive for you to do.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {relevantCategories
            .filter((category) => !teamGoals?.includes(category.id))
            .map(categoryRender)}
          {relevantObjectives.map(objRender)}
        </div>
      </div>
    </div>
  );
}
