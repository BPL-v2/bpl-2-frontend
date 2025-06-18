import { Item } from "@client/api";
import { useGetGuildStashTab } from "@client/query";
import { Dialog } from "@components/dialog";
import { StashTabGrid } from "@components/stash-tab-grid";
import { StashTabSpecial } from "@components/stash-tab-special";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { getColor } from "@utils/item";
import { useContext, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/admin/guild-stashes/$stashId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { stashId } = useParams({ from: Route.id });
  const {
    data: currentTab,
    isPending,
    isError,
  } = useGetGuildStashTab(currentEvent.id, stashId);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref.current]);

  if (isPending || isError || !currentTab.type) {
    return (
      <div
        className="bg-base-200"
        style={{ width: width, height: width }}
      ></div>
    );
  }
  return (
    <div ref={ref}>
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

      {currentTab.type === "PremiumStash" || currentTab.type === "QuadStash" ? (
        <StashTabGrid
          size={width}
          tab={currentTab}
          onItemClick={(item) => {
            setSelectedItem(item);
            setOpen(true);
          }}
        ></StashTabGrid>
      ) : (
        <StashTabSpecial
          tab={currentTab}
          size={width}
          onItemClick={(item) => {
            setSelectedItem(item);
            setOpen(true);
          }}
        ></StashTabSpecial>
      )}
    </div>
  );
}
