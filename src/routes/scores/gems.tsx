import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { ItemTable } from "@components/item-table";
import { GameVersion } from "@client/api";
import { createFileRoute } from "@tanstack/react-router";
import { ruleWrapper } from "./route";
import { Ranking } from "@components/ranking";
import { GemTabRules } from "@rules/gems";
import { useFile } from "@client/query";
import clsx from "clsx";

export const Route = createFileRoute("/scores/gems")({
  component: () => ruleWrapper(<GemTab />, <GemTabRules />),
});

function toColor(color: string, active: boolean): React.ReactNode {
  switch (color) {
    case "r":
      return (
        <span
          className={clsx(
            "join-item btn",
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
            "join-item btn",
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
            "join-item btn",
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

export function GemTab() {
  const { currentEvent, scores, gameVersion } = useContext(GlobalStateContext);
  const [color, setColor] = React.useState<"r" | "g" | "b" | undefined>();
  const { data: gemColors } = useFile<Record<"r" | "g" | "b", string[]>>(
    "/assets/poe1/items/gem_colors.json"
  );
  useEffect(() => {
    if (gameVersion !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [gameVersion]);
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
      <TeamScoreDisplay objective={gemCategory} />
      <div className="divider divider-primary">{gemCategory.name}</div>
      <div className="flex flex-col gap-4 items-center">
        <Ranking
          objective={gemCategory}
          maximum={gemCategory.children.length}
          actual={(teamId: number) =>
            gemCategory.children.filter((o) => o.team_score[teamId]?.finished)
              .length
          }
          description="Gems:"
        />
        <div className="join">
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
        <ItemTable
          objective={gemCategory}
          filter={(obj) => {
            if (!color) return true;
            const baseType = obj.conditions.find(
              (c) => c.field === "BASE_TYPE"
            );
            if (!baseType) return false;
            return gemColors[color].includes(baseType.value);
          }}
        />
      </div>
    </>
  );
}
