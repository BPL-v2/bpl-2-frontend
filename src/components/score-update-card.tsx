import { useContext } from "react";
import { getMetaInfo, ScoreDiff } from "../types/score";
import { GlobalStateContext } from "../utils/context-provider";
import { ObjectiveIcon } from "./objective-icon";

type ScoreUpdateCardProps = {
  update: ScoreDiff;
  remove: (update: ScoreDiff) => void;
};

export const ScoreUpdateCard = ({ update, remove }: ScoreUpdateCardProps) => {
  const { users, scores, currentEvent, gameVersion } =
    useContext(GlobalStateContext);
  const meta = getMetaInfo(update, users, scores, currentEvent?.teams);
  let body: JSX.Element | null = null;
  let title: string | null = null;
  if (meta.objective) {
    body = (
      <div className="card-body flex gap-2 flex-row">
        <ObjectiveIcon objective={meta.objective} gameVersion={gameVersion} />
        <p className="text-lg">{`${meta.userName} scored "${meta.objective?.name}" in section "${meta.category?.name}"`}</p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  } else if (meta.category) {
    const img_location = `assets/${gameVersion}/icons/${meta.category.name}.svg`;
    body = (
      <div className="card-body flex gap-2 flex-row">
        <img className="max-h-14" src={img_location} />
        <p className="text-lg">{meta.category?.name} was finished</p>
      </div>
    );
    title = meta.teamName + " +" + meta.points;
  }
  return (
    <div className="card bg-base-300 border-1 border-info w-1">
      <div className="card-title top-box-rounded flex items-center pb-4 px-4 bg-base-200  mr-0">
        <h1 className="flex-grow text-left mt-4 text-xl mx-4">{title}</h1>
        <button className="btn" onClick={() => remove(update)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {body}
    </div>
  );
  return null;
};
