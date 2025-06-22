import { useContext, useMemo } from "react";
import { ScoringMethod } from "@client/api";
import { GlobalStateContext } from "@utils/context-provider";
import { createFileRoute } from "@tanstack/react-router";
import { ScoreObjective } from "@mytypes/score";
import { flatMap } from "@utils/utils";
import {
  useGetCharacterEventHistory,
  useGetEventStatus,
  useGetTeamGoals,
  useGetUser,
} from "@client/query";

export const Route = createFileRoute("/scores/for-you")({
  component: ForYouTab,
});

export function ForYouTab() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { user } = useGetUser();
  const { characterHistory } = useGetCharacterEventHistory(
    currentEvent.id,
    user?.id
  );
  const { teamGoals } = useGetTeamGoals(currentEvent.id);

  const personalObjectiveRender = useMemo(() => {
    characterHistory?.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    const char = {
      level: 0,
      atlas_node_count: 0,
      ascendancy_points: 0,
    };
    if (characterHistory && characterHistory.length > 0) {
      characterHistory.forEach((stat) => {
        char.level = Math.max(char.level, stat.level || 0);
        char.atlas_node_count = Math.max(
          char.atlas_node_count,
          stat.atlas_node_count || 0
        );
        char.ascendancy_points = Math.max(
          char.ascendancy_points,
          stat.ascendancy_points || 0
        );
      });
    }
    const lastPointsProgress =
      Math.max(char.level / 90, char.atlas_node_count / 40) * 100;
    return (
      <div>
        <h2 className="mt-4">Personal Objectives</h2>
        <p>
          Help your team out by improving your character and earn up to 9 points
          for your team.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 ">
          <div
            className={`card bg-base-300 border-2 ${
              char.level >= 80 ? "border-success" : "border-error"
            }`}
          >
            <div className="card-body">
              <div className="card-title text-3xl">{"Reach lvl 80"}</div>
              {char.level >= 80 ? (
                <div className="text-lg text-left text-success">
                  {"+3 Points"}
                </div>
              ) : null}
            </div>
            <progress
              className={`progress w-full rounded-b-box rounded-t-none  ${
                char.level >= 80 ? "progress-success" : "progress-error"
              }`}
              value={char.level}
              max={80}
            ></progress>
          </div>
          <div
            className={`card bg-base-300 border-2 ${
              char.ascendancy_points >= 8 ? "border-success" : "border-error"
            }`}
          >
            <div className="card-body">
              <div className="card-title text-3xl">{"Fully Ascend"}</div>
              {char.ascendancy_points >= 8 ? (
                <div className="text-lg text-left text-success">
                  {"+3 Points"}
                </div>
              ) : (
                <div className="text-lg text-left text-warning">
                  {"Ask for Lab carries if you need help"}
                </div>
              )}
            </div>
            <progress
              className={`progress w-full rounded-b-box rounded-t-none  ${
                char.ascendancy_points >= 8
                  ? "progress-success"
                  : "progress-error"
              }`}
              value={char.ascendancy_points}
              max={8}
            ></progress>
          </div>
          <div
            className={`card col-span-2 bg-base-300 rounded-box border-2 ${
              char.atlas_node_count >= 40 || char.level >= 90
                ? "border-success"
                : "border-error"
            }`}
          >
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div
                  className={`card bg-base-200 w-full border-2 ${
                    char.level >= 90 ? "border-success" : "border-error"
                  }`}
                >
                  <div className="card-body">
                    <div className="card-title text-3xl">{"Reach lvl 90"}</div>
                  </div>
                  <progress
                    className={`progress w-full rounded-b-box rounded-t-none  ${
                      char.level >= 90 ? "progress-success" : "progress-error"
                    }`}
                    value={char.level}
                    max={90}
                  ></progress>
                </div>
                <div className="divider divider-vertical sm:divider-horizontal text-2xl font-semibold">
                  OR
                </div>
                <div
                  className={`card bg-base-200 w-full border-2 ${
                    char.atlas_node_count >= 40
                      ? "border-success"
                      : "border-error"
                  }`}
                >
                  <div className="card-body">
                    <div className="card-title text-3xl">
                      {"Gain 40 Atlas Passives"}
                    </div>
                  </div>
                  <progress
                    className={`progress w-full rounded-b-box rounded-t-none  ${
                      char.atlas_node_count >= 40
                        ? "progress-success"
                        : "progress-error"
                    }`}
                    value={char.atlas_node_count}
                    max={40}
                  ></progress>
                </div>
              </div>
              {char.atlas_node_count >= 40 || char.level >= 90 ? (
                <div className="text-lg text-left text-success">
                  {"+3 Points"}
                </div>
              ) : null}
            </div>
            <progress
              className={`progress w-full rounded-b-box rounded-t-none  ${
                lastPointsProgress >= 100
                  ? "progress-success"
                  : "progress-error"
              }`}
              value={lastPointsProgress}
              max={100}
            ></progress>
          </div>
        </div>
      </div>
    );
  }, [characterHistory]);
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
    <div className="prose prose-xl text-left max-w-max flex flex-col px-4 2xl:px-0">
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
