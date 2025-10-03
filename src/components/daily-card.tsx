import { useContext, useState } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { CollectionCardTable } from "./collection-card-table";
import { ObjectiveIcon } from "./objective-icon";
import { Countdown } from "./countdown";
import { ScoreObjective } from "@mytypes/score";
import { ObjectiveType, ScoringMethod } from "@client/api";
import { twMerge } from "tailwind-merge";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { SubmissionDialog } from "./submission-diablog";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEventStatus } from "@client/query";

export type DailyCardProps = {
  daily: ScoreObjective;
};

function bonusAvailableCounter(
  valid_to: string | null | undefined,
  onFinish: () => void,
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
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();
  const { eventStatus } = useGetEventStatus(currentEvent.id);

  if (!currentEvent || !daily.valid_from) {
    return <></>;
  }
  const isReleased = new Date(daily.valid_from) < new Date();

  if (!isReleased) {
    return (
      <div className="card bborder bg-base-300" key={daily.id}>
        <div className="h-full min-h-25 rounded-t-box bg-base-200 p-8 text-center text-xl font-semibold">
          Daily not yet available
        </div>
        <div className="card-body rounded-b-box bg-base-300 p-8">
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
    true,
  );

  const isRace =
    daily.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME;
  const isAvailable = daily.valid_to && new Date(daily.valid_to) > new Date();
  const canSubmit =
    daily.objective_type === ObjectiveType.SUBMISSION && !!eventStatus?.team_id;
  return (
    <>
      <SubmissionDialog
        objective={daily}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <div
        className={twMerge(
          "card bborder bg-base-200",
          isRace && isAvailable ? "outline-4 outline-info" : "",
        )}
        key={daily.id}
      >
        <div className="card-title flex h-full min-h-25 items-center rounded-t-box bborder-b bg-base-200 px-4 py-2">
          {canSubmit ? (
            <div
              className="tooltip tooltip-left lg:tooltip-top"
              data-tip="Submit Bounty"
            >
              <button
                className="rounded-full"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <PlusCircleIcon className="h-8 w-8 cursor-pointer" />
              </button>
            </div>
          ) : (
            <ObjectiveIcon
              objective={daily}
              gameVersion={currentEvent.game_version}
            />
          )}
          <div className={daily.extra ? "tooltip tooltip-primary" : undefined}>
            <div className="tooltip-content max-w-75 text-xl">
              {daily.extra}
            </div>

            <h3 className="mx-4 flex-grow text-center text-lg font-medium">
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
          <div className="flex min-h-15 items-center justify-center rounded-b-box">
            {bonusAvailableCounter(daily.valid_to, () => {
              qc.refetchQueries({
                queryKey: ["rules", currentEvent.id],
              });
            })}
          </div>
        )}
      </div>
    </>
  );
}
