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
    "Weapon 1",
    "Weapon 2",
  ];
  const flaskSlots = ["Flask 1", "Flask 2", "Flask 3", "Flask 4", "Flask 5"];
  const jewels: Item[] = [];
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
    }
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
        {Object.entries(equipment).map(([slot, item]) => (
          <ItemDisplay
            key={slot}
            item={item}
            slot={slot}
            selectionSetter={setSelectedItem}
            setMousePosition={setItemPosition}
          />
        ))}
        <div className="flasks">
          {Object.entries(flasks).map(([slot, item]) => (
            <ItemDisplay
              key={slot}
              item={item}
              slot={slot}
              selectionSetter={setSelectedItem}
              setMousePosition={setItemPosition}
            />
          ))}
        </div>
        <div className="col-span-full"></div>
        {jewels.map((item) => {
          return (
            <ItemDisplay
              key={item.id}
              item={item}
              slot={item?.slot}
              selectionSetter={setSelectedItem}
              setMousePosition={setItemPosition}
            />
          );
        })}
      </div>
    </div>
  );
}
