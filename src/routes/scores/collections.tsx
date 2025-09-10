import { GameVersion, Objective } from "@client/api";
import { CollectionCardTable } from "@components/collection-card-table";
import { ObjectiveIcon } from "@components/objective-icon";
import TeamScoreDisplay from "@components/team-score";
import { getImageLocation } from "@mytypes/scoring-objective";
import { CollectionTabRules } from "@rules/collections";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { JSX, useContext } from "react";

export const Route = createFileRoute("/scores/collections")({
  component: CollectionTab,
  // @ts-ignore context is not typed
  loader: async ({ context: { queryClient } }) => {
    const rules = queryClient.getQueryData(["rules", "current"]) as Objective;
    rules?.children
      .find((child) => child.name === "Collections")
      ?.children.map((objective) =>
        getImageLocation(objective, GameVersion.poe1)
      )
      .filter((url): url is string => url !== null)
      .forEach((url) => {
        const img = new Image();
        img.src = url;
      });
  },
});

export function CollectionTab(): JSX.Element {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = scores?.children.find((cat) => cat.name === "Collections");
  const { rules } = Route.useSearch();
  if (!category || !currentEvent) {
    return <></>;
  }
  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <CollectionTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={category}></TeamScoreDisplay>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.children.map((objective) => {
            return (
              <div className="card bg-base-300 bborder" key={objective.id}>
                <div className="card-title rounded-t-box flex items-center m-0 py-2 px-4 bg-base-200 h-full min-h-22 bborder-b">
                  <ObjectiveIcon
                    objective={objective}
                    gameVersion={currentEvent.game_version}
                  />
                  <div
                    className={
                      objective.extra ? "tooltip tooltip-primary" : undefined
                    }
                  >
                    <div className="tooltip-content text-xl max-w-75 ">
                      {objective.extra}
                    </div>
                    <h3 className="flex-grow text-center text-xl font-medium mx-4">
                      {`${objective.required_number} ${objective.name}`}
                      {objective.extra ? (
                        <i className="text-red-600">*</i>
                      ) : null}
                    </h3>
                  </div>
                </div>
                <div className="mb-0 bg-base-300 rounded-b-box">
                  <CollectionCardTable objective={objective} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
