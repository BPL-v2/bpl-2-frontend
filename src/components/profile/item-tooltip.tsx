import { Item, Rarity } from "@utils/pob";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  item?: Item;
  itemX?: number;
  itemY?: number;
};

export function ItemTooltip({ item, itemX, itemY }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const maxWidth = 400;
  const [position, setPosition] = useState({
    left: itemX,
    top: (itemY || 0) > 10 ? itemY : 10,
  });
  useEffect(() => {
    setPosition({
      left: itemX,
      top: (itemY || 0) > 10 ? itemY : 10,
    });
  }, [item, itemX, itemY]);

  useEffect(() => {
    if (!tooltipRef.current) return;

    let top = position.top;
    let left = position.left;
    if (
      window.innerHeight < tooltipRef.current.getBoundingClientRect().bottom
    ) {
      top = window.innerHeight - tooltipRef.current!.offsetHeight - 10;
    }
    if (window.innerWidth < tooltipRef.current.getBoundingClientRect().right) {
      left = window.innerWidth - tooltipRef.current!.offsetWidth - 30;
    }
    setPosition({ left, top });
  }, [position.left, position.top]);

  if (!item) return null;

  let headerColor = "";
  let borderColor = "";
  switch (item.rarity) {
    case Rarity.Unique:
      headerColor = "text-unique";
      borderColor = "border-unique";
      break;
    case Rarity.Rare:
      headerColor = "text-rare";
      borderColor = "border-rare";
      break;
    case Rarity.Magic:
      headerColor = "text-magic";
      borderColor = "border-magic";
      break;
    case Rarity.Normal:
      headerColor = "text-normal";
      borderColor = "border-normal";
      break;
  }
  return (
    <div
      ref={tooltipRef}
      className={twMerge(
        "pointer-events-none fixed z-30 text-xs md:text-base",
        "gap flex flex-col rounded-lg border-2 bg-base-100/80 text-center shadow-lg md:bg-base-100/90",
        position.left != 0 && position.top != 0 ? "block" : "hidden",
        borderColor,
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: maxWidth,
        maxHeight: "90vh",
      }}
    >
      <div
        className={twMerge(
          "flex w-full flex-col p-2 text-sm font-bold md:text-xl",
          headerColor,
        )}
      >
        <p>{item.name}</p>
        <p>{item.name.includes(item.base) ? "" : item.base}</p>
      </div>
      {(item.armour > 0 ||
        item.evasion > 0 ||
        item.energyShield > 0 ||
        item.quality > 0) && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.quality > 0 && (
            <div>
              <span className="text-base-content/70">
                Quality{item.altQuality ? ` (${item.altQuality})` : ""}:{" "}
              </span>
              <span className="text-magic">+{item.quality}% </span>
            </div>
          )}
          {item.armour > 0 && (
            <div>
              <span className="text-base-content/70">Armour: </span>
              <span className="text-magic">{item.armour} </span>
            </div>
          )}
          {item.evasion > 0 && (
            <div>
              <span className="text-base-content/70">Evasion Rating: </span>
              <span className="text-magic">{item.evasion} </span>
            </div>
          )}
          {item.energyShield > 0 && (
            <div>
              <span className="text-base-content/70">Energy Shield: </span>
              <span className="text-magic">{item.energyShield} </span>
            </div>
          )}
        </div>
      )}
      {item.implicits.length > 0 && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.implicits.map((implicit) => (
            <span
              key={implicit.line}
              className={implicit.crafted ? "text-crafted" : "text-magic"}
            >
              {implicit.line}
            </span>
          ))}
        </div>
      )}
      {(item.explicits.length > 0 || item.mutatedMods.length > 0) && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.explicits.map((explicit) => (
            <span
              key={explicit.line}
              className={
                explicit.crafted
                  ? "text-crafted"
                  : explicit.fractured
                    ? "text-fractured"
                    : "text-magic"
              }
            >
              {explicit.line}
            </span>
          ))}
          {item.mutatedMods.map((mutated) => (
            <span key={mutated.line} className={"text-mutated"}>
              {mutated.line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
