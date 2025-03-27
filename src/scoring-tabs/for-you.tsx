import { useContext, useEffect, useState } from "react";
import { teamApi } from "../client/client";
import { ScoringMethod, Suggestions } from "../client";
import { GlobalStateContext } from "../utils/context-provider";
import { flattenCategories } from "../types/scoring-category";
import { ScoreCategory, ScoreObjective } from "../types/score";

export function ForYouTab() {
  const { currentEvent, scores, eventStatus } = useContext(GlobalStateContext);
  const [teamGoals, setTeamGoals] = useState<Suggestions>({
    category_ids: [],
    objective_ids: [],
  });

  useEffect(() => {
    if (!currentEvent) {
      return;
    }
    teamApi.getTeamSuggestions(currentEvent.id).then(setTeamGoals);
  }, [currentEvent]);

  if (!scores) {
    return <div>Loading...</div>;
  }
  const teamId = eventStatus?.team_id!;
  if (!teamId) {
    return;
  }

  const categories = flattenCategories(scores);

  const relevantCategories = categories
    .filter(
      (category) =>
        category.scoring_preset?.scoring_method ===
          ScoringMethod.RANKED_COMPLETION_TIME &&
        eventStatus.team_id !== undefined &&
        !category.team_score[eventStatus.team_id]?.finished
    )
    .sort((a, b) => {
      return (
        a.objectives.filter(
          (objective) => !objective.team_score[teamId]?.finished
        ).length /
          a.objectives.length -
        b.objectives.filter(
          (objective) => !objective.team_score[teamId]?.finished
        ).length /
          b.objectives.length
      );
    });

  const relevantObjectives = categories.flatMap((category) =>
    category.objectives
      .filter(
        (objective) =>
          objective.scoring_preset?.scoring_method ===
            ScoringMethod.RANKED_TIME &&
          !objective.team_score[eventStatus.team_id!]?.finished
      )
      .sort((a, b) => {
        return (
          (b.team_score[teamId]?.number || 0) / b.required_number -
          (a.team_score[teamId]?.number || 0) / a.required_number
        );
      })
  );
  function catRender(cat: ScoreCategory) {
    const totalObjectives = cat.objectives.length;
    const unfinishedObjectives = cat.objectives.filter(
      (obj) => !obj.team_score[teamId]?.finished
    );
    return (
      <div className="card bg-base-300" key={cat.id}>
        <div className="card-body">
          <div tabIndex={0} className="collapse bg-base-200 items-start">
            <div className="card-title collapse-title flex justify-between text-lg pe-px-4 px-4">
              <div>{cat.name}</div>{" "}
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
            <div>{obj.name}</div>{" "}
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
  const userPOs = {
    level: 81,
    ascencion_points: 8,
    atlas_passives: 40,
  };

  const x = Math.max(userPOs.level / 90, userPOs.atlas_passives / 40) * 100;

  return (
    <div className="prose prose-xl text-left max-w-max flex flex-col px-4 2xl:px-0">
      <div>
        <h2 className="mt-4">Personal Objectives</h2>
        <p>
          Help your team out by improving your character and earn up to 9 points
          for your team.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 ">
          <div
            className={`card bg-base-300 border-2 ${
              userPOs.level >= 80 ? "border-success" : "border-error"
            }`}
          >
            <div className="card-body">
              <div className="card-title text-3xl">{"Reach lvl 80"}</div>
              {userPOs.level >= 80 ? (
                <div className="text-lg text-left text-success">
                  {"+3 Points"}
                </div>
              ) : null}
            </div>
            <progress
              className={`progress w-full rounded-b-box rounded-t-none  ${
                userPOs.level >= 80 ? "progress-success" : "progress-error"
              }`}
              value={userPOs.level}
              max={80}
            ></progress>
          </div>
          <div
            className={`card bg-base-300 border-2 ${
              userPOs.ascencion_points >= 8 ? "border-success" : "border-error"
            }`}
          >
            <div className="card-body">
              <div className="card-title text-3xl">{"Fully Ascend"}</div>
              {userPOs.ascencion_points >= 8 ? (
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
                userPOs.ascencion_points >= 8
                  ? "progress-success"
                  : "progress-error"
              }`}
              value={userPOs.ascencion_points}
              max={8}
            ></progress>
          </div>
          <div
            className={`card col-span-2 bg-base-300 rounded-box border-2 ${
              userPOs.atlas_passives >= 40 || userPOs.level >= 90
                ? "border-success"
                : "border-error"
            }`}
          >
            <div className="card-body ">
              <div className="flex flex-row items-center gap-2">
                <div
                  className={`card bg-base-200  border-2 ${
                    userPOs.level >= 90 ? "border-success" : "border-error"
                  }`}
                >
                  <div className="card-body">
                    <div className="card-title text-3xl">{"Reach lvl 90"}</div>
                  </div>
                  <progress
                    className={`progress w-full rounded-b-box rounded-t-none  ${
                      userPOs.level >= 90
                        ? "progress-success"
                        : "progress-error"
                    }`}
                    value={userPOs.level}
                    max={90}
                  ></progress>
                </div>
                <div className="divider divider-horizontal text-2xl font-semibold">
                  OR
                </div>
                <div
                  className={`card bg-base-200 border-2 ${
                    userPOs.atlas_passives >= 40
                      ? "border-success"
                      : "border-error"
                  }`}
                >
                  <div className="card-body">
                    <div className="card-title text-3xl">
                      {"Gain 40 Atlas Passives"}
                    </div>
                  </div>{" "}
                  <progress
                    className={`progress w-full rounded-b-box rounded-t-none  ${
                      userPOs.atlas_passives >= 40
                        ? "progress-success"
                        : "progress-error"
                    }`}
                    value={userPOs.atlas_passives}
                    max={40}
                  ></progress>
                </div>
              </div>
              {userPOs.atlas_passives >= 40 || userPOs.level >= 90 ? (
                <div className="text-lg text-left text-success">
                  {"+3 Points"}
                </div>
              ) : null}
            </div>
            <progress
              className={`progress w-full rounded-b-box rounded-t-none  ${
                x >= 100 ? "progress-success" : "progress-error"
              }`}
              value={x}
              max={100}
            ></progress>
          </div>
        </div>
      </div>{" "}
      <div>
        <h2>Team lead suggestions</h2>
        <p>
          Your team leads have selected objectives that are urgent for you to
          do.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {relevantCategories
            .filter((category) => teamGoals.category_ids.includes(category.id))
            .map(catRender)}
          {relevantObjectives
            .filter((obj) => teamGoals.objective_ids.includes(obj.id))
            .map(objRender)}
        </div>
      </div>
      <div>
        <h2>Remaining</h2>
        <p>Other objectives that are time sensitive for you to do.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {relevantCategories
            .filter((category) => !teamGoals.category_ids.includes(category.id))
            .map(catRender)}
          {relevantObjectives
            .filter((obj) => !teamGoals.objective_ids.includes(obj.id))
            .map(objRender)}
        </div>
      </div>
    </div>
  );
}
