import { useGetEventStatus, useGetTeamGoals } from "@client/query";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  category: ScoreObjective;
}

export default function ProgressCard({ category }: Props) {
  const { currentEvent } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { teamGoals = [] } = useGetTeamGoals(currentEvent.id);
  const teamId = eventStatus?.team_id;
  const message = teamGoals.find(
    (goal) => goal.objective_id === category.id,
  )?.extra;
  const childLeaves = category.children.filter(
    (obj) => obj.children.length === 0,
  );
  let requiredNum = childLeaves.length;

  if (!teamId) {
    return <></>;
  }
  const unfinishedObjectives = childLeaves.filter(
    (obj) => !obj.team_score[teamId]?.finished,
  );
  let currentNum = requiredNum - unfinishedObjectives.length;

  if (childLeaves.length === 0) {
    requiredNum = category.required_number;
    currentNum = category.team_score[teamId]?.number || 0;
  }
  if (currentNum > requiredNum) {
    return <></>;
  }
  return (
    <div className="flex flex-col shadow-xl" key={category.id}>
      <div className="h-full flex-row gap-1 rounded-t-lg rounded-b-none border-2 border-b-0 bg-card p-2">
        {unfinishedObjectives.length > 0 ? (
          <div tabIndex={0} className="collapse items-start">
            <div className="collapse-title flex justify-between gap-4 p-4 text-lg font-bold">
              <div>{category.name}</div>
              <div className="whitespace-nowrap text-primary">
                {currentNum} / {requiredNum}
              </div>
            </div>
            <ul className="not-prose collapse-content list">
              <li className="p-4 pb-2 text-xs tracking-wide opacity-60">
                Missing Items
              </li>
              {unfinishedObjectives.map((obj) => (
                <li className="list-row" key={obj.id}>
                  {obj.name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex justify-between gap-4 p-4 text-lg font-bold">
            <div>{category.name}</div>
            <div className="whitespace-nowrap text-primary">
              {currentNum} / {requiredNum}
            </div>
          </div>
        )}
        {message && (
          <div className="tooltip">
            <div className="tooltip-content p-4 text-left text-lg whitespace-pre-wrap text-error">
              {message}
            </div>
            <EnvelopeIcon className="size-6 cursor-help text-error"></EnvelopeIcon>
          </div>
        )}
      </div>
      <div className="h-4 w-full rounded-t-none rounded-b-lg border-2 border-t-0 border-highlight bg-primary/30">
        <div
          className={twMerge(
            "h-full rounded-r-full rounded-bl-full bg-primary",
          )}
          style={{
            width: `${(currentNum / requiredNum) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
