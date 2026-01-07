import { CollectionCardTable } from "@components/cards/collection-card-table";
import { ObjectiveIcon } from "@components/objective-icon";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

export interface CollectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  objective: ScoreObjective;
  ignoreExtra?: boolean;
  showPoints?: boolean;
}

export function CollectionCard({
  objective,
  ignoreExtra = false,
  showPoints = true,
  ...props
}: CollectionCardProps) {
  const { currentEvent } = useContext(GlobalStateContext);

  return (
    <div
      key={objective.id}
      {...props}
      className={twMerge("card bborder bg-card shadow-xl", props.className)}
    >
      <div className="m-0 card-title flex h-full min-h-22 items-center rounded-t-box bborder-b bg-base-300/50 px-4 py-2">
        <ObjectiveIcon
          objective={objective}
          gameVersion={currentEvent.game_version}
        />
        <div
          className={twMerge(
            "w-full",
            objective.extra && !ignoreExtra && "tooltip tooltip-primary",
          )}
        >
          {objective.extra && !ignoreExtra ? (
            <div className="tooltip-content max-w-75 text-xl">
              {objective.extra}
            </div>
          ) : null}
          <h3 className="grow text-center text-xl font-medium">
            {`${objective.required_number.toLocaleString()} ${objective.name}`}
            {objective.extra && !ignoreExtra ? (
              <i className="text-red-600">*</i>
            ) : null}
          </h3>
        </div>
      </div>
      <div className="mb-0 rounded-b-box">
        <CollectionCardTable
          objective={objective}
          showPoints={showPoints}
          roundedBottom
        />
      </div>
    </div>
  );
}
