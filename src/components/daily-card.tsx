import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { CollectionCardTable } from "./collection-card-table";
import { ObjectiveIcon } from "./objective-icon";
import { Countdown } from "./countdown";
import { useQueryClient } from "@tanstack/react-query";
import { ScoreObjective } from "@mytypes/score";
import { ScoringMethod } from "@client/api";

export type DailyCardProps = {
  daily: ScoreObjective;
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
  const { currentEvent } = useContext(GlobalStateContext);
  const qc = useQueryClient();

  if (!currentEvent) {
    return <></>;
  }
  // need to deep copy the base objective to avoid modifying the original

  if (daily.valid_from && new Date(daily.valid_from) > new Date()) {
    return (
      <div className="card bg-base-300" key={daily.id}>
        <div className="rounded-t-box p-8 bg-base-200 h-25 text-center text-xl font-semibold">
          Daily not yet available
        </div>
        <div className="card-body bg-base-300 p-8 rounded-b-box">
          <p className="text-center text-lg">The daily will be available in:</p>
          <div className="flex justify-center">
            <Countdown target={new Date(daily.valid_from)} />
          </div>
        </div>
      </div>
    );
  }
  const finished = Object.values(daily.team_score).reduce(
    (acc, score) => score.finished && acc,
    true
  );

  return (
    <div className="card bg-base-200" key={daily.id}>
      <div className="card-title rounded-t-box flex items-center m-0 px-4 bg-base-200 h-25">
        <ObjectiveIcon
          objective={daily}
          gameVersion={currentEvent.game_version}
        />
        <div
          className={daily.extra ? "tooltip text-2xl" : undefined}
          data-tip={daily.extra}
        >
          <h3 className="flex-grow text-center mt-4 text-xl font-medium mx-4">
            {daily.scoring_preset?.scoring_method ===
            ScoringMethod.RANKED_TIME ? (
              <b className="font-extrabold">Race: </b>
            ) : (
              ""
            )}
            {daily.name}
            {daily.extra ? <i className="text-error">*</i> : null}
          </h3>
        </div>
      </div>

      <CollectionCardTable objective={daily} />
      {!finished && (
        <div className="py-4 mb-0 rounded-b-box">
          {bonusAvailableCounter(daily.valid_to, () => {
            qc.refetchQueries({
              queryKey: ["rules", currentEvent.id],
            });
          })}
        </div>
      )}
    </div>
  );
}
