import { useContext } from "react";
import { getMetaInfo, ScoreDiff } from "../types/score";
import { GlobalStateContext } from "../utils/context-provider";
import { ObjectiveIcon } from "./objective-icon";

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
  const { users, scores, currentEvent, gameVersion } =
    useContext(GlobalStateContext);
  const meta = getMetaInfo(update, users, scores, currentEvent?.teams);
  let body: JSX.Element | null = null;
  let title: string | null = null;
  if (meta.objective) {
    const bodyText = (
      <div className="text-lg text-left">
        {`${meta.userName} scored "${meta.objective?.name}"`}
        {meta.objective.extra ? (
          <text className="text-primary">{` [${meta.objective.extra}]`}</text>
        ) : null}
        {meta.category?.name ? ` in "${meta.category?.name}"` : null}
      </div>
    );
    body = (
      <div className="card-body flex  flex-row items-center gap-8">
        <div className="h-20 w-20">
          <ObjectiveIcon
            className=""
            objective={meta.objective}
            gameVersion={gameVersion}
          />{" "}
        </div>

        {bodyText}
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  } else if (meta.category) {
    const img_location = `assets/${gameVersion}/icons/${meta.category.name}.svg`;
    body = (
      <div className="card-body flex gap-2 flex-row">
        <div className="h-20 w-20">
          <img className="h-full w-full object-contain" src={img_location} />
        </div>
        <p className="text-lg text-left">
          {meta.category?.name} was finished in {meta.rank}. place
        </p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  }
  return (
    <div className="card bg-base-300 ring-1 ring-primary w-full">
      <div className="card-title top-box-rounded flex items-center pb-4 px-4 bg-base-200  mr-0">
        <h1 className="flex-grow text-left  text-xl mx-4 mt-4">{title}</h1>
        <div className="flex justify-end gap-2 mt-4">
          {closeAll ? (
            <button className="btn btn-error btn-sm" onClick={closeAll}>
              close all
            </button>
          ) : null}
          <button
            className="btn btn-warning btn-sm"
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
