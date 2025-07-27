import {
  useGetGuildStash,
  useSwitchStashFetching,
  useUpdateGuildStashTab,
} from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { router } from "../../../router";

export const Route = createFileRoute("/admin/guild-stashes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const stashId = useRouterState({
    select: (state) => state.location.pathname.split("/").slice(-1)[0],
  });
  const qc = useQueryClient();
  const { guildStashes } = useGetGuildStash(currentEvent.id);
  const { switchStashFetching } = useSwitchStashFetching(qc, currentEvent.id);
  const { updateGuildStashTab } = useUpdateGuildStashTab(qc, currentEvent.id);
  const [hideDisabled, setHideDisabled] = useState(true);
  const [highlightScoring, setHighlightScoring] = useState(true);
  useEffect(() => {
    const firstStash = guildStashes?.find(
      (stash) => stash.fetch_enabled && !stash.parent_id
    );
    if (stashId == "guild-stashes" && firstStash) {
      router.navigate({
        to: "/admin/guild-stashes/$stashId",
        replace: true,
        params: { stashId: firstStash.id },
        search: { highlightScoring },
      });
    }
  }, [stashId, guildStashes, highlightScoring]);

  const [stashSearch, setStashSearch] = useState("");
  dayjs.extend(relativeTime);

  return (
    <div>
      <div className="flex flex-row gap-2 items-center justify-center mt-2">
        <input
          type="text"
          placeholder="Search Stash Tabs"
          className="input input-bordered w-full max-w-xs"
          value={stashSearch}
          onChange={(e) => setStashSearch(e.target.value)}
        />
        <button
          className="btn btn-primary w-43"
          onClick={() => setHideDisabled(!hideDisabled)}
        >
          {hideDisabled ? "Show" : "Hide"} Disabled Tabs
        </button>
        <button
          className="btn btn-secondary w-53"
          onClick={() => {
            setHighlightScoring(!highlightScoring);
            router.navigate({
              to: "/admin/guild-stashes/$stashId",
              params: { stashId },
              search: { highlightScoring: !highlightScoring },
            });
          }}
        >
          {highlightScoring ? "Show" : "Hide"} Non-Objective Items
        </button>
      </div>
      <div className="flex flex-row gap-2 mt-2 justify-center">
        <div className="flex flex-col gap-1 overflow-y-auto h-[80vh] w-[35vw]">
          {guildStashes
            ?.filter((stash) => {
              if (stash.parent_id) return false; // Exclude child tabs
              if (hideDisabled && !stash.fetch_enabled) return false;
              if (stash.type === "Folder") return false;
              if (!stashSearch) return true;
              const search = stashSearch.toLowerCase();
              return (
                stash.name.toLowerCase().includes(search) ||
                stash.type.toLowerCase().includes(search)
              );
            })
            .sort((a, b) => a.index || 0 - (b.index || 0))
            .map((stash) => (
              <div
                className="tooltip tooltip-primary tooltip-bottom"
                data-tip={stash.user_ids.length + " users eligible to fetch"}
                key={stash.id}
              >
                <div
                  className="flex flex-row items-center gap-2"
                  key={stash.id}
                >
                  {!hideDisabled ? (
                    <input
                      type="checkbox"
                      checked={stash.fetch_enabled}
                      onChange={() => switchStashFetching(stash.id)}
                      className="checkbox checkbox-primary"
                    />
                  ) : null}
                  <Link
                    to={`/admin/guild-stashes/$stashId`}
                    params={{ stashId: stash.id }}
                    key={stash.id}
                    className="p-2 border-2 rounded-xl flex flex-row items-center gap-2 w-full justify-between text-left"
                    style={{ borderColor: "#" + (stash.color || "000000") }}
                    activeProps={{
                      className: "bg-base-300",
                    }}
                    inactiveProps={{
                      className: "bg-base-100 border-dotted",
                    }}
                    search={{ highlightScoring }}
                  >
                    <img
                      src={`/assets/${currentEvent.game_version}/stashtabs/${stash.type.toLowerCase().replace("stash", "")}.png`}
                      alt={stash.type}
                    ></img>
                    <h3 className="text-sm w-full">{stash.name}</h3>
                    <button
                      className="btn btn-sm btn-primary whitespace-break-spaces"
                      onClick={() => {
                        updateGuildStashTab(stash.id);
                      }}
                    >
                      {dayjs(stash.last_fetch).fromNow()}
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
        <div className="w-[65vw]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
