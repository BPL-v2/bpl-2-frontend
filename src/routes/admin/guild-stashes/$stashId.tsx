import { Item } from "@client/api";
import { useGetGuildStash, useGetGuildStashItems } from "@client/query";
import { Dialog } from "@components/dialog";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useState } from "react";

export const Route = createFileRoute("/admin/guild-stashes/$stashId")({
  component: RouteComponent,
});

function getColor(item: Item): string {
  switch (item.rarity) {
    case "Unique":
      return "#B66216";
    case "Rare":
      return "#FDFD77";
    case "Magic":
      return "#7C7CEA";
    case "Normal":
      return "#ADADAD";
    default:
      return "#ADADAD";
  }
}

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { stashId } = useParams({ from: Route.id });
  const { data: items } = useGetGuildStashItems(currentEvent.id, stashId);
  const { data: tabs } = useGetGuildStash(currentEvent.id);
  const stash = tabs?.find((tab) => tab.id === stashId);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const occupied = new Set<string>();
  let gridNum = 24;
  if (stash?.type === "PremiumStash") {
    gridNum = 12;
  } else if (stash?.type === "QuadStash") {
    gridNum = 24;
  }

  return (
    <div className="flex items-center justify-center">
      <Dialog
        open={open}
        setOpen={setOpen}
        title={
          <div
            className="flex flex-col items-center"
            style={{ color: getColor(selectedItem || {}) }}
          >
            {selectedItem?.name ? <p> {selectedItem?.name}</p> : null}
            <p> {selectedItem?.typeLine}</p>
          </div>
        }
        closeOnOutsideClick={true}
      >
        <div className="text-left whitespace-pre">
          {JSON.stringify(selectedItem, null, 4)}
        </div>
      </Dialog>
      <div
        className={`grid gap-1 aspect-square h-[90vh]`}
        style={{
          gridTemplateColumns: `repeat(${gridNum}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridNum}, minmax(0, 1fr))`,
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
              const textSize = gridNum === 24 ? "text-xs" : "";
              const padding = gridNum === 24 ? "px-[2px]" : "px-[4px]";
              return (
                <div
                  className="tooltip tooltip-bottom relative cursor-pointer"
                  data-tip={`${item.name} ${item.typeLine}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setOpen(true);
                  }}
                  style={{
                    gridColumn: `${i + 1} / span ${width}`,
                    gridRow: `${j + 1} / span ${height}`,
                  }}
                >
                  <img
                    key={`${i}-${j}`}
                    className="w-full h-full border-1"
                    style={{
                      borderColor: getColor(item),
                      objectFit: "contain",
                    }}
                    src={item.icon}
                    alt={item.name}
                  />
                  <div
                    className={`absolute left-0 top-0 select-none ${textSize} ${padding}`}
                  >
                    {(item.stackSize || 0) > 0 ? item.stackSize : null}
                  </div>
                </div>
              );
            }
            return (
              <div
                key={`${i}-${j}`}
                className="col-span-1 row-span-1 bg-base-200 border-1 border-gray-700 w-full h-full select-none"
              ></div>
            );
          })
        )}
      </div>
    </div>
  );
}
