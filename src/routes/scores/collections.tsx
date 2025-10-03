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
        getImageLocation(objective, GameVersion.poe1),
      )
      .filter((url): url is string => url !== null)
      .forEach((url) => {
        const img = new Image();
        img.src = url;
      });
  },
});

function CollectionTab(): JSX.Element {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = scores?.children.find((cat) => cat.name === "Collections");
  const { rules } = Route.useSearch();
  if (!category || !currentEvent) {
    return <></>;
  }
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <CollectionTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={category}></TeamScoreDisplay>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.children.map((objective) => {
            return (
              <div className="card bborder bg-base-300" key={objective.id}>
                <div className="m-0 card-title flex h-full min-h-22 items-center rounded-t-box bborder-b bg-base-200 px-4 py-2">
                  <ObjectiveIcon
                    objective={objective}
                    gameVersion={currentEvent.game_version}
                  />
                  <div
                    className={
                      objective.extra ? "tooltip tooltip-primary" : undefined
                    }
                  >
                    <div className="tooltip-content max-w-75 text-xl">
                      {objective.extra}
                    </div>
                    <h3 className="mx-4 flex-grow text-center text-xl font-medium">
                      {`${objective.required_number} ${objective.name}`}
                      {objective.extra ? (
                        <i className="text-red-600">*</i>
                      ) : null}
                    </h3>
                  </div>
                </div>
                <div className="mb-0 rounded-b-box bg-base-300">
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
