import React from "react";
import { DisplayItem, GuildStashTabGGG } from "@client/api";
import clsx from "clsx";

type Props = {
  tab: GuildStashTabGGG;
  size?: number;
  onItemClick?: (item: DisplayItem) => void;
  highlightScoring?: boolean;
};

function fixCategoryName(name?: string): string {
  if (!name) return "";
  if (name.includes("Flask")) {
    return "Flask";
  }
  name = name.replace("One Hand ", "").replace("Two Hand ", "");
  return name;
}

export const StashTabUnique: React.FC<Props> = ({
  tab,
  size = 1000,
  onItemClick,
  highlightScoring = true,
}) => {
  const [selectedCategory, setSelectedCategory] =
    React.useState<GuildStashTabGGG>(
      tab.children?.filter(
        (child) => !highlightScoring || child.items?.some((i) => i.objectiveId)
      )?.[0] || tab
    );

  return (
    <div
      style={{
        width: size,
        height: "90vh",
        overflowY: "auto",
        scrollbarGutter: "stable",
      }}
    >
      <div className="flex flex-row gap-1 mb-2 flex-wrap">
        {tab.children
          ?.filter((child) => {
            if (highlightScoring && !child.items?.some((i) => i.objectiveId)) {
              return false;
            }
            return true;
          })
          .map((child) => (
            <button
              key={child.id}
              className={clsx(
                "btn btn-sm",
                child.id === selectedCategory.id ? "btn-primary" : "bg-base-300"
              )}
              onClick={() => setSelectedCategory(child)}
            >
              {fixCategoryName(child.name)}
            </button>
          ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedCategory.items
          ?.filter((item) => {
            return !highlightScoring || item.objectiveId;
          })
          .sort((a, b) => (b.h || 1) - (a.h || 1))
          .map((item, idx) => {
            return (
              <div
                className={clsx(
                  "card basis-42 w-42 cursor-pointer",
                  item.objectiveId
                    ? "bg-base-300 border-2 border-primary"
                    : "bg-base-200"
                )}
                key={"item-" + idx}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <div className="items-center card-body select-none rounded-box">
                  <span className="text-unique font-bold h-15">
                    {item.name}
                  </span>
                  <img
                    className="m-auto"
                    data-tip={`${item.name} ${item.typeLine}`}
                    src={item.icon}
                    alt={item.name}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
