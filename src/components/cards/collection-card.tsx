import { CollectionCardTable } from "@components/cards/collection-card-table";
import { ObjectiveIcon } from "@components/objective-icon";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";

export interface CollectionCardProps {
  objective: ScoreObjective;
}

export function CollectionCard({ objective }: CollectionCardProps) {
  const { currentEvent } = useContext(GlobalStateContext);

  return (
    <div className="card bborder bg-card shadow-xl" key={objective.id}>
      <div className="m-0 card-title flex h-full min-h-22 items-center rounded-t-box bborder-b bg-base-300/50 px-4 py-2">
        <ObjectiveIcon
          objective={objective}
          gameVersion={currentEvent.game_version}
        />
        <div
          className={objective.extra ? "tooltip tooltip-primary" : undefined}
        >
          <div className="tooltip-content max-w-75 text-xl">
            {objective.extra}
          </div>
          <h3 className="mx-4 flex-grow text-center text-xl font-medium">
            {`${objective.required_number} ${objective.name}`}
            {objective.extra ? <i className="text-red-600">*</i> : null}
          </h3>
        </div>
      </div>
      <div className="mb-0 rounded-b-box">
        <CollectionCardTable objective={objective} roundedBottom />
      </div>
    </div>
  );
}
