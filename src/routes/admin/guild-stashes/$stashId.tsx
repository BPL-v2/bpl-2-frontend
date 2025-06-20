import { Item } from "@client/api";
import { useGetGuildStashTab } from "@client/query";
import { Dialog } from "@components/dialog";
import { StashTabGrid } from "@components/stash-tab-grid";
import { StashTabSpecial } from "@components/stash-tab-special";
import { StashTabUnique } from "@components/stash-tab-unique";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { getColor } from "@utils/item";
import { useContext, useEffect, useRef, useState } from "react";

type StashType = "Grid" | "Special" | "Unique";
export type ScoreQueryParams = {
  highlightScoring: boolean;
};
export const Route = createFileRoute("/admin/guild-stashes/$stashId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, boolean>): ScoreQueryParams => {
    return {
      highlightScoring: search.highlightScoring,
    };
  },
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { stashId } = useParams({ from: Route.id });
  const { highlightScoring } = useSearch({
    from: Route.id,
  });
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
  }, [ref.current]); // eslint-disable-line
  if (isPending || isError || !currentTab) {
    return (
      <div
        className="bg-base-200"
        style={{ width: width, height: width }}
      ></div>
    );
  }
  let type: StashType = "Special";
  if (currentTab.type === "PremiumStash" || currentTab.type === "QuadStash") {
    type = "Grid";
  } else if (currentTab.type === "UniqueStash") {
    type = "Unique";
  }

  return (
    <div ref={ref}>
      <Dialog
        className="max-w-xl max-h-[80vh]"
        open={open}
        setOpen={setOpen}
        title={
          <div>
            <ClipboardDocumentCheckIcon
              className="absolute to-0 right-6 cursor-pointer h-8 w-8 hover:text-primary"
              onClick={() => {
                if (selectedItem) {
                  navigator.clipboard.writeText(
                    JSON.stringify(selectedItem, null, 2)
                  );
                }
              }}
            ></ClipboardDocumentCheckIcon>
            <div
              className="flex flex-col items-center mb-[-1rem]"
              style={{ color: getColor(selectedItem || {}) }}
            >
              {selectedItem?.name ? <p> {selectedItem?.name}</p> : null}
              <p> {selectedItem?.typeLine}</p>
            </div>
          </div>
        }
        closeOnOutsideClick={true}
      >
        <div className="">
          <div className="divider m-0"></div>

          <div className="flex flex-col">
            {selectedItem?.properties?.map((prop) => {
              if (prop.displayMode === 3) {
                const values = prop.values?.map((v) => v[0]);
                let name = prop.name || "";
                values?.forEach((value, i) => {
                  name = name.replace(`{${i}}`, value);
                });

                return <span className="text-base-content/80">{name}</span>;
              }
              return (
                <p>
                  <span className="text-base-content/80">{prop.name}:</span>{" "}
                  <span className="text-info font-semibold">
                    {prop.values?.[0]?.[0] || prop.values?.[0]?.[1]}{" "}
                    {prop.displayMode == 1 ? prop.values?.[0]?.[1] : ""}
                  </span>
                </p>
              );
            })}
          </div>
          {selectedItem?.ilvl !== 0 && (
            <>
              <div className="divider m-0"></div>
              <span className="text-base-content/80">Item Level:</span>{" "}
              <span className="text-info font-semibold">
                {selectedItem?.ilvl}
              </span>
            </>
          )}
          {selectedItem?.implicitMods && (
            <>
              <div className="divider m-0"></div>
              <div className="flex flex-col text-info font-semibold">
                {selectedItem.implicitMods.map((mod, idx) => (
                  <p key={idx}>{mod}</p>
                ))}
              </div>
            </>
          )}
          {selectedItem?.explicitMods && (
            <>
              <div className="divider m-0"></div>
              <div className="flex flex-col text-info font-semibold">
                {selectedItem.explicitMods.map((mod, idx) => (
                  <p key={idx}>{mod}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </Dialog>

      {type == "Grid" && (
        <StashTabGrid
          size={width}
          tab={currentTab}
          onItemClick={(item) => {
            setSelectedItem(item);
            setOpen(true);
          }}
          highlightScoring={highlightScoring}
        ></StashTabGrid>
      )}
      {type == "Special" && (
        <StashTabSpecial
          tab={currentTab}
          size={width}
          onItemClick={(item) => {
            setSelectedItem(item);
            setOpen(true);
          }}
          highlightScoring={highlightScoring}
        ></StashTabSpecial>
      )}
      {type == "Unique" && (
        <StashTabUnique
          tab={currentTab}
          size={width}
          onItemClick={(item) => {
            setSelectedItem(item);
            setOpen(true);
          }}
          highlightScoring={highlightScoring}
        />
      )}
    </div>
  );
}
