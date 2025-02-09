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
  if (meta.points <= 0) {
    return;
  }
  if (meta.objective) {
    let text = `${meta.userName} scored "${meta.objective?.name}"`;
    if (meta.category?.name) {
      text += ` in section "${meta.category?.name}"`;
    }
    body = (
      <div className="card-body flex gap-2 flex-row">
        <ObjectiveIcon objective={meta.objective} gameVersion={gameVersion} />
        <p className="text-lg">{text}</p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  } else if (meta.category) {
    const img_location = `assets/${gameVersion}/icons/${meta.category.name}.svg`;
    body = (
      <div className="card-body flex gap-2 flex-row">
        <img className="max-h-14" src={img_location} />
        <p className="text-lg">
          {meta.category?.name} was finished in {meta.rank}. place
        </p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  }
  return (
    <div className="card bg-base-300 ring-1 ring-primary w-1">
      <div className="card-title top-box-rounded flex items-center pb-4 px-4 bg-base-200  mr-0">
        <h1 className="flex-grow text-left  text-xl mx-4 mt-4">{title}</h1>
        <div className="flex justify-end gap-2 mt-4">
          {closeAll ? (
            <button className="btn btn-error btn-sm" onClick={closeAll}>
              close all
            </button>
          ) : null}
          <button
            className="btn btn-warning  btn-sm"
            onClick={() => close(update)}
          >
            close
          </button>
        </div>
      </div>
      {body}
    </div>
  );
  return null;
};
