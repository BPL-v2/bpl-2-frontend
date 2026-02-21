import React, { useMemo } from "react";
import { Item, GuildStashTabGGG } from "@client/api";
import { twMerge } from "tailwind-merge";

type Props = {
  tab: GuildStashTabGGG;
  size?: number;
  onItemClick?: (item: Item) => void;
  highlightScoring?: boolean;
};

export const StashTabUnordered: React.FC<Props> = ({
  tab,
  size = 1000,
  onItemClick,
  highlightScoring,
}) => {
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
      className={"grid max-h-[90vh] grid-cols-24 gap-1"}
      style={{
        width: size,
      }}
    >
      {items.map((item, index) => {
        const maximumStackSize = item.properties
          ?.find((prop) => prop.name === "Stack Size")
          ?.values?.[0]?.[0]?.split("/")?.[1];
        return (
          <div
            key={index}
            className={twMerge(
              "relative flex aspect-square cursor-pointer flex-col items-center justify-center border p-0.5",
            )}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div
              className="tooltip tooltip-bottom"
              data-tip={item.name || item.typeLine}
            >
              <img
                src={item.icon}
                alt={item.name}
                className="max-h-full max-w-full"
              />
              {item.stackSize && item.stackSize > 1 && (
                <div
                  className={twMerge(
                    "absolute right-0 bottom-0 m-0.5 rounded bg-black text-xs font-bold text-white",
                    item.stackSize >= (maximumStackSize || 0)
                      ? "text-info"
                      : "text-white",
                  )}
                >
                  {item.stackSize}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
