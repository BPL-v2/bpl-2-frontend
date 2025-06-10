import {
  useGetGuildStash,
  useSwitchStashFetching,
  useUpdateGuildStash,
  useUpdateGuildStashTab,
} from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { router } from "../../../router";

export const Route = createFileRoute("/admin/guild-stashes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent, gameVersion } = useContext(GlobalStateContext);
  const { stashId } = useParams({ from: Route.id });
  const queryClient = useQueryClient();
  const { data: guildStashes } = useGetGuildStash(currentEvent.id);
  const { mutate: updateGuildStashes } = useUpdateGuildStash(
    queryClient,
    currentEvent.id
  );
  const { mutate: switchGuildStash } = useSwitchStashFetching(
    queryClient,
    currentEvent.id
  );
  const { mutate: updateGuildStashTab } = useUpdateGuildStashTab(
    queryClient,
    currentEvent.id
  );
  const [hideDisabled, setHideDisabled] = useState(true);
  dayjs.extend(relativeTime);

  if (!stashId) {
    const firstStashId = guildStashes?.find((s) => s.fetch_enabled)?.id;
    if (firstStashId) {
      router.navigate({
        to: "/admin/guild-stashes/$stashId",
        replace: true,
        params: { stashId: firstStashId },
      });
    }
    return null;
  }
  return (
    <div>
      <button
        className="btn btn-primary "
        onClick={() => {
          updateGuildStashes(); // Example stash ID
        }}
      >
        Update Guild Stash
      </button>{" "}
      <button
        className="btn btn-primary "
        onClick={() => setHideDisabled(!hideDisabled)}
      >
        {hideDisabled ? "Show" : "Hide"} Disabled Tabs
      </button>{" "}
      <div className="flex flex-row gap-2 mt-2 justify-center">
        <div className="flex flex-col gap-1 overflow-y-auto h-[90vh]">
          {guildStashes
            ?.filter((stash) => !hideDisabled || stash.fetch_enabled)
            .filter((stash) => stash.type !== "Folder")
            .sort((a, b) => a.index || 0 - (b.index || 0))
            .map((stash) => (
              <div className="flex flex-row items-center gap-2" key={stash.id}>
                {!hideDisabled ? (
                  <input
                    type="checkbox"
                    checked={stash.fetch_enabled}
                    onChange={() => {
                      switchGuildStash(stash.id);
                    }}
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
                >
                  <img
                    src={`/assets/${gameVersion}/stashtabs/${stash.type.toLowerCase().replace("stash", "")}.png`}
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
            ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
