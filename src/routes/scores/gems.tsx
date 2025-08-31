import React, { JSX, useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { ItemTable } from "@components/item-table";
import { GameVersion } from "@client/api";
import { createFileRoute } from "@tanstack/react-router";
import { Ranking } from "@components/ranking";
import { GemTabRules } from "@rules/gems";
import { useFile } from "@client/query";
import clsx from "clsx";

export const Route = createFileRoute("/scores/gems")({
  component: GemTab,
});

function toColor(color: string, active: boolean): React.ReactNode {
  switch (color) {
    case "r":
      return (
        <span
          className={clsx(
            "join-item btn btn-lg",
            active ? "bg-red-400 text-black" : "bg-base-300"
          )}
        >
          Red
        </span>
      );
    case "g":
      return (
        <span
          className={clsx(
            "join-item btn btn-lg",
            active ? "bg-green-400 text-black" : "bg-base-300"
          )}
        >
          Green
        </span>
      );
    case "b":
      return (
        <span
          className={clsx(
            "join-item btn btn-lg",
            active ? "bg-blue-400 text-black" : "bg-base-300"
          )}
        >
          Blue
        </span>
      );
    default:
      return null;
  }
}

export function GemTab(): JSX.Element {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const [color, setColor] = React.useState<"r" | "g" | "b" | undefined>();
  const { data: gemColors } = useFile<Record<"r" | "g" | "b" | "w", string[]>>(
    "/assets/poe1/items/gem_colors.json"
  );
  const { rules } = Route.useSearch();
  useEffect(() => {
    if (currentEvent.game_version !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [currentEvent]);
  if (!currentEvent || !scores) {
    return <></>;
  }
  const gemCategory = scores.children.find(
    (category) => category.name === "Gems"
  );

  if (!gemCategory || !gemColors) {
    return <></>;
  }

  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <GemTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={gemCategory} />
        <div className="join w-full justify-center">
          {["r", "g", "b"].map((c) => (
            <div
              key={c}
              onClick={() => {
                if (color === c) {
                  setColor(undefined);
                } else {
                  setColor(c as "r" | "g" | "b");
                }
              }}
            >
              {toColor(c, c === color)}
            </div>
          ))}
        </div>
        {gemCategory.children.map((category) => {
          return (
            <div key={category.id} className="bg-base-200 rounded-box p-8 p">
              <div className="divider divider-primary">{category.name}</div>
              <div className="flex flex-col gap-4 items-center">
                <Ranking
                  objective={category}
                  maximum={category.children.length}
                  actual={(teamId: number) =>
                    category.children.filter(
                      (o) => o.team_score[teamId]?.finished
                    ).length
                  }
                  description="Gems:"
                />
                <ItemTable
                  objective={category}
                  filter={(obj) => {
                    if (!color) return true;
                    const baseType = obj.conditions.find(
                      (c) => c.field === "BASE_TYPE"
                    );
                    if (!baseType) return false;
                    return gemColors[color].includes(baseType.value);
                  }}
                  className="w-full h-[50vh]"
                  styles={{
                    header: "bg-base-100",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
