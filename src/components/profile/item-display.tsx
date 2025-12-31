import { encode } from "@mytypes/scoring-objective";
import { Item, Rarity } from "@utils/pob";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

type ItemDisplayProps = {
  item?: Item;
  slot: string | null;
  selectionSetter: (item?: Item) => void;
  setMousePosition: (pos?: { x: number; y: number }) => void;
};
function getLink(item: Item) {
  let link = "/assets/poe1/items/";
  if (item.rarity === Rarity.Unique) {
    link +=
      "uniques/" + encode(item.name.replaceAll("Foulborn ", "")) + ".webp";
  } else {
    link += "basetypes/" + encode(item.base.split(" (")[0]) + ".webp";
  }
  return link;
}

export function ItemDisplay({
  item,
  slot,
  selectionSetter,
  setMousePosition,
}: ItemDisplayProps) {
  const itemRef = useRef<HTMLImageElement>(null);
  if (!slot) {
    slot = item?.slot || "Unknown";
  }
  const handleMouseEnter = () => {
    if (!item || !itemRef.current) return;
    selectionSetter(item);
    const rect = itemRef.current.getBoundingClientRect();
    setMousePosition({
      x: rect.right + 10,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    selectionSetter(undefined);
    setMousePosition(undefined);
  };
  if (!item && slot === "Ring 3") {
    return;
  }

  return (
    <div
      key={"item-" + slot}
      className={twMerge(
        "relative flex h-full w-full items-center justify-center rounded-lg bg-base-200 p-1",
        item && "cursor-help",
        slot.replaceAll(" ", "").toLowerCase(),
        item?.modsChangedFromLastSnapshot && "outline outline-info",
        item?.changedFromLastSnapshot && "outline outline-success",
      )}
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item && (
        <img
          className="flex aspect-square h-full w-full items-center object-contain p-1"
          src={getLink(item)}
          alt={item?.name}
        />
      )}
    </div>
  );
}
