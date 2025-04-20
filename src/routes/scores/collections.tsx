import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { getSubCategory } from "@mytypes/scoring-category";
import TeamScore from "@components/team-score";
import { CollectionCardTable } from "@components/collection-card-table";
import { ObjectiveIcon } from "@components/objective-icon";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/scores/collections")({
  component: CollectionTab,
});

export function CollectionTab() {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, "Collections");

  if (!category || !currentEvent) {
    return <></>;
  }
  return (
    <>
      <TeamScore category={category}></TeamScore>
      <div className="divider divider-primary">Collection Goals</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {category.objectives.map((objective) => {
          return (
            <div className="card bg-base-300" key={objective.id}>
              <div className="card-title rounded-t-box flex items-center m-0 px-4 bg-base-200 h-25  ">
                <ObjectiveIcon
                  objective={objective}
                  gameVersion={currentEvent.game_version}
                />
                <div
                  className={objective.extra ? "tooltip  text-2xl " : undefined}
                  data-tip={objective.extra}
                >
                  <h3 className="flex-grow text-center mt-4 text-xl font-medium mx-4">
                    {`Collect ${objective.required_number} ${objective.name}`}
                    {objective.extra ? <i className="text-red-600">*</i> : null}
                  </h3>
                </div>
              </div>
              <div className="pb-4 mb-0 bg-base-300 rounded-b-box">
                <CollectionCardTable objective={objective} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
