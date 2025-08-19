import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { CollectionCardTable } from "./collection-card-table";
import { ObjectiveIcon } from "./objective-icon";
import { Countdown } from "./countdown";
import { useQueryClient } from "@tanstack/react-query";
import { ScoreObjective } from "@mytypes/score";
import { ScoringMethod } from "@client/api";
import { twMerge } from "tailwind-merge";

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

  if (!currentEvent || !daily.valid_from) {
    return <></>;
  }
  const isReleased = new Date(daily.valid_from) < new Date();

  if (!isReleased) {
    return (
      <div className="card bg-base-300 bborder" key={daily.id}>
        <div className="rounded-t-box p-8 bg-base-200 h-full min-h-25 text-center text-xl font-semibold">
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
  const isFinished = Object.values(daily.team_score).reduce(
    (acc, score) => score.finished && acc,
    true
  );

  const isRace =
    daily.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME;
  const isAvailable = daily.valid_to && new Date(daily.valid_to) > new Date();
  return (
    <div
      className={twMerge(
        "card bg-base-200 bborder",
        isRace && isAvailable ? "outline-4 outline-info" : ""
      )}
      key={daily.id}
    >
      <div className="card-title rounded-t-box flex items-center py-2 px-4 bg-base-200 h-full min-h-25 bborder-b">
        <ObjectiveIcon
          objective={daily}
          gameVersion={currentEvent.game_version}
        />
        <div
          className={daily.extra && "tooltip text-2xl"}
          data-tip={daily.extra}
        >
          <h3 className="flex-grow text-center text-lg font-medium mx-4">
            {isRace ? <b className="font-extrabold text-info">Race: </b> : ""}
            {daily.name}
            {daily.extra ? <i className="text-error">*</i> : null}
          </h3>
        </div>
      </div>
      <div className={twMerge("bg-base-300", isFinished && "rounded-b-box")}>
        <CollectionCardTable objective={daily} />
      </div>
      {!isFinished && (
        <div className="flex items-center justify-center rounded-b-box min-h-15">
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
