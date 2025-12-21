import { Item, PathOfBuilding } from "@utils/pob";
import { ItemDisplay } from "./item-display";
import { ItemTooltip } from "./item-tooltip";
import { useState } from "react";

export function CharacterItems({ pob }: { pob: PathOfBuilding }) {
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [itemPosition, setItemPosition] = useState<{
    x: number;
    y: number;
  }>();
  const equipmentSlots = [
    "Helmet",
    "Body Armour",
    "Gloves",
    "Boots",
    "Belt",
    "Amulet",
    "Ring 1",
    "Ring 2",
    "Ring 3",
    "Weapon 1",
    "Weapon 2",
  ];
  const flaskSlots = ["Flask 1", "Flask 2", "Flask 3", "Flask 4", "Flask 5"];
  const jewels: Item[] = [];
  const grafts: Item[] = [];
  const equipment = equipmentSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>,
  );
  const flasks = flaskSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>,
  );
  for (const item of pob.items) {
    if (!item.slot) continue;
    if (item.slot.includes("Abyssal") || item.slot.includes("Socket")) {
      jewels.push(item);
    } else if (equipmentSlots.includes(item.slot)) {
      equipment[item.slot] = item;
    } else if (flaskSlots.includes(item.slot)) {
      flasks[item.slot] = item;
    } else if (item.slot.includes("Graft")) {
      grafts.push(item);
    }
  }
  function toItemdisplay([slot, item]: [string | null, Item | undefined]) {
    return (
      <ItemDisplay
        key={item?.id}
        item={item}
        slot={slot}
        selectionSetter={setSelectedItem}
        setMousePosition={setItemPosition}
      />
    );
  }

  return (
    <div className="flex w-full justify-center rounded-box bg-base-300 p-4 select-none lg:w-[40%] lg:p-8">
      {selectedItem && (
        <ItemTooltip
          item={selectedItem}
          itemX={itemPosition?.x}
          itemY={itemPosition?.y}
        />
      )}
      <div className="inventory m-auto mt-0 gap-1 md:gap-2">
        {Object.entries(equipment).map(toItemdisplay)}
        <div className="flasks">
          {Object.entries(flasks).map(toItemdisplay)}
        </div>
        <div className="col-span-full"></div>
        {grafts
          .map((item) => [item.slot, item] as [string, Item])
          .map(toItemdisplay)}
        {jewels
          .map((item) => [item.slot, item] as [string, Item])
          .map(toItemdisplay)}
      </div>
    </div>
  );
}
