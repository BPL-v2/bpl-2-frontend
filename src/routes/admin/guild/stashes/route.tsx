import {
  useGetEventStatus,
  useGetGuildStash,
  useSwitchStashFetching,
  useUpdateGuildStashTab,
} from "@client/query";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { getPermissions } from "@utils/token";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useContext, useState } from "react";
import { router } from "../../../../main";

export const Route = createFileRoute("/admin/guild/stashes")({
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
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const [stashSearch, setStashSearch] = useState("");
  dayjs.extend(relativeTime);
  const permissions = getPermissions();
  if (permissions.length === 0 && !eventStatus?.is_team_lead) {
    return "You do not have permission to view this page.";
  }
  return (
    <div>
      <div className="mt-2 flex flex-row items-center justify-center gap-2">
        <input
          type="text"
          placeholder="Search Stash Tabs"
          className="input-bordered input w-full max-w-xs"
          value={stashSearch}
          onChange={(e) => setStashSearch(e.target.value)}
        />
        <button
          className="btn w-43 btn-primary"
          onClick={() => setHideDisabled(!hideDisabled)}
        >
          {hideDisabled ? "Show" : "Hide"} Disabled Tabs
        </button>
        <button
          className="btn w-53 btn-secondary"
          onClick={() => {
            setHighlightScoring(!highlightScoring);
            router.navigate({
              to: "/admin/guild/stashes/$stashId",
              params: { stashId },
              search: { highlightScoring: !highlightScoring },
            });
          }}
        >
          {highlightScoring ? "Show" : "Hide"} Non-Objective Items
        </button>
      </div>
      <div className="mt-2 flex flex-row justify-center gap-2">
        <div className="flex h-[80vh] w-[35vw] flex-col gap-1 overflow-y-auto">
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
                className="tooltip tooltip-bottom tooltip-primary"
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
                    to={"/admin/guild/stashes/$stashId"}
                    params={{ stashId: stash.id }}
                    key={stash.id}
                    className="flex w-full flex-row items-center justify-between gap-2 rounded-xl border-2 p-2 text-left"
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
                    <h3 className="w-full text-sm">{stash.name}</h3>
                    <button
                      className="btn whitespace-break-spaces btn-sm btn-primary"
                      onClick={() => {
                        updateGuildStashTab(stash.id);
                      }}
                    >
                      {dayjs(stash.last_fetch).fromNow()}
                      <ArrowPathIcon className="size-4" />
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
