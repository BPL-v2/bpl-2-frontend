import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { CollectionCardTable } from "./collection-card-table";
import { Daily } from "@mytypes/scoring-objective";
import { ObjectiveIcon } from "./objective-icon";
import { scoringApi } from "@client/client";
import { Countdown } from "./countdown";

export type DailyCardProps = {
  daily: Daily;
};

function bonusAvailableCounter(
  valid_to: string | null | undefined,
  onFinish: () => void
) {
  if (!valid_to) {
    return null;
  }
  if (new Date(valid_to) < new Date()) {
    return <p className="text-lg"> Daily no longer available</p>;
  }
  return (
    <div className="flex flex-row justify-center gap-4 p-2">
      <p className="text-center text-lg">Daily available for</p>
      <div className="flex justify-center">
        <Countdown target={new Date(valid_to)} size="small" />
      </div>
    </div>
  );
}

export function DailyCard({ daily }: DailyCardProps) {
  const { currentEvent, setRules } = useContext(GlobalStateContext);
  if (!currentEvent || !daily.baseObjective) {
    return <></>;
  }
  // need to deep copy the base objective to avoid modifying the original
  const objective = JSON.parse(JSON.stringify(daily.baseObjective));
  if (daily.raceObjective) {
    Object.entries(daily.raceObjective.team_score).forEach(
      ([teamId, score]) => {
        // @ts-ignore
        objective.team_score[teamId].points += score.points;
      }
    );
  }
  if (
    daily.baseObjective.valid_from &&
    new Date(daily.baseObjective.valid_from) > new Date()
  ) {
    return (
      <div className="card bg-base-300" key={daily.baseObjective.id}>
        <div className="rounded-t-box p-8 bg-base-200 h-25 text-center text-xl font-semibold">
          Daily not yet available
        </div>
        <div className="card-body bg-base-300 p-8 rounded-b-box">
          <p className="text-center text-lg">The daily will be available in:</p>
          <div className="flex justify-center">
            <Countdown target={new Date(daily.baseObjective.valid_from)} />
          </div>
        </div>
      </div>
    );
  }
  objective.valid_to = daily.valid_to;
  const finished = Object.values(daily.baseObjective.team_score).reduce(
    (acc, score) => score.finished && acc,
    true
  );

  return (
    <div className="card bg-base-200" key={objective.id}>
      <div className="card-title rounded-t-box flex items-center m-0 px-4 bg-base-200 h-25">
        <ObjectiveIcon
          objective={objective}
          gameVersion={currentEvent.game_version}
        />
        <div
          className={objective.extra ? "tooltip text-2xl" : undefined}
          data-tip={objective.extra}
        >
          <h3 className="flex-grow text-center mt-4 text-xl font-medium mx-4">
            {daily.raceObjective ? (
              <b className="font-extrabold">Race: </b>
            ) : (
              ""
            )}
            {objective.name}
            {objective.extra ? <i className="text-error">*</i> : null}
          </h3>
        </div>
      </div>

      <CollectionCardTable objective={objective} />
      {!finished && (
        <div className="py-4 mb-0 rounded-b-box">
          {bonusAvailableCounter(daily.valid_to, () => {
            scoringApi.getRulesForEvent(currentEvent.id).then(setRules);
          })}
        </div>
      )}
    </div>
  );
}
