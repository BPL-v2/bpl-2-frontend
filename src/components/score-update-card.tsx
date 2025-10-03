import { JSX, useContext } from "react";
import { getMetaInfo } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { ObjectiveIcon } from "./objective-icon";
import { ScoreDiff } from "@client/api";
import { useGetUsers } from "@client/query";

type ScoreUpdateCardProps = {
  update: ScoreDiff;
  close: (update: ScoreDiff) => void;
  closeAll?: () => void;
};

export const ScoreUpdateCard = ({
  update,
  close,
  closeAll,
}: ScoreUpdateCardProps) => {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const { users } = useGetUsers(currentEvent.id);
  const meta = getMetaInfo(update, users, scores, currentEvent?.teams);
  let body: JSX.Element | null = null;
  let title: string | null = null;
  if (meta.objective) {
    const bodyText = (
      <div className="text-left text-lg">
        {`${meta.userName} scored "${meta.objective?.name}"`}
        {meta.objective.extra ? (
          <text className="text-primary">{` [${meta.objective.extra}]`}</text>
        ) : null}
        {meta.parent?.name ? ` in "${meta.parent?.name}"` : null}
      </div>
    );
    body = (
      <div className="card-body flex flex-row items-center gap-8">
        <div className="h-20 w-20">
          <ObjectiveIcon
            className=""
            objective={meta.objective}
            gameVersion={currentEvent.game_version}
          />
        </div>

        {bodyText}
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  } else if (meta.parent) {
    const img_location = `assets/${currentEvent.game_version}/icons/${meta.parent.name}.svg`;
    body = (
      <div className="card-body flex flex-row gap-2">
        <div className="h-20 w-20">
          <img
            className="h-full w-full object-contain"
            src={img_location}
            alt={meta.parent.name}
          />
        </div>
        <p className="text-left text-lg">
          {meta.parent?.name} was finished in {meta.rank}. place
        </p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  }
  return (
    <div className="card w-full bg-base-300 ring-1 ring-primary">
      <div className="mr-0 card-title flex items-center rounded-t-box bg-base-200 px-4 pb-4">
        <h1 className="mx-4 mt-4 flex-grow text-left text-xl">{title}</h1>
        <div className="mt-4 flex justify-end gap-2">
          {closeAll ? (
            <button className="btn btn-sm btn-error" onClick={closeAll}>
              close all
            </button>
          ) : null}
          <button
            className="btn btn-sm btn-warning"
            onClick={() => close(update)}
          >
            close
          </button>
        </div>
      </div>
      {body}
    </div>
  );
};
