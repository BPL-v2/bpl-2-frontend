import React, { useMemo } from "react";
import { DisplayItem, GuildStashTabGGG } from "@client/api";
import { twMerge } from "tailwind-merge";

type Props = {
  tab: GuildStashTabGGG;
  size?: number;
  onItemClick?: (item: DisplayItem) => void;
  highlightScoring?: boolean;
};

export const StashTabGrid: React.FC<Props> = ({
  tab,
  size = 1000,
  onItemClick,
  highlightScoring,
}) => {
  const occupied = new Set<string>();
  const gridNum = tab?.type === "PremiumStash" ? 12 : 24;
  const items = useMemo(() => {
    return (
      tab.items?.filter((item) => {
        if (highlightScoring && !item.objectiveId) {
          return false;
        }
        return true;
      }) || []
    );
  }, [tab.items, highlightScoring]);
  return (
    <div
      className={"grid aspect-square h-[90vh] gap-1"}
      style={{
        gridTemplateColumns: `repeat(${gridNum}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridNum}, minmax(0, 1fr))`,
        width: size,
        height: size,
      }}
    >
      {[...Array(gridNum)].flatMap((_, i) =>
        [...Array(gridNum)].map((_, j) => {
          if (occupied.has(`${i}-${j}`)) return null;
          const item = items?.find((item) => item.x === i && item.y === j);
          if (item) {
            const width = item.w || 1;
            const height = item.h || 1;
            for (let dx = 0; dx < width; dx++) {
              for (let dy = 0; dy < height; dy++) {
                occupied.add(`${i + dx}-${j + dy}`);
              }
            }
            let borderColor = "border-white";
            let tooltipColor = "tooltip-white";
            switch (item.rarity) {
              case "Unique":
                tooltipColor = "tooltip-unique";
                borderColor = "border-unique";
                break;
              case "Rare":
                tooltipColor = "tooltip-rare";
                borderColor = "border-rare";
                break;
              case "Magic":
                tooltipColor = "tooltip-magic";
                borderColor = "border-magic";
                break;
            }
            return (
              <div
                key={`${i}-${j}-${item.id}`}
                className={twMerge(
                  "tooltip relative tooltip-bottom cursor-pointer",
                  tooltipColor,
                )}
                data-tip={`${item.name} ${item.typeLine}`}
                onClick={() => onItemClick && onItemClick(item)}
                style={{
                  gridColumn: `${i + 1} / span ${width}`,
                  gridRow: `${j + 1} / span ${height}`,
                }}
              >
                <img
                  key={`${i}-${j}`}
                  className={twMerge("h-full w-full border-1", borderColor)}
                  style={{
                    objectFit: "contain",
                  }}
                  src={item.icon}
                  alt={item.name}
                />
                <div
                  className={twMerge(
                    "absolute top-0 left-0 select-none",
                    gridNum === 24 ? "px-[2px] text-xs" : "px-[4px]",
                  )}
                >
                  {(item.stackSize || 0) > 0 ? item.stackSize : null}
                </div>
              </div>
            );
          }
          return (
            <div
              key={`${i}-${j}`}
              className="col-span-1 row-span-1 h-full w-full border-1 border-gray-700 bg-base-200 select-none"
            ></div>
          );
        }),
      )}
    </div>
  );
};
