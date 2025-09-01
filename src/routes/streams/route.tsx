import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useContext } from "react";
import { TwitchStreamEmbed } from "@components/twitch-stream";
import { GlobalStateContext } from "@utils/context-provider";
import { EventStatus, Team } from "@client/api";
import { useGetEventStatus, useGetStreams, useGetUsers } from "@client/query";
import { usePageSEO } from "@utils/use-seo";

export const Route = createFileRoute("/streams")({
  component: TwitchPage,
});

function teamSort(
  eventStatus: EventStatus | undefined
): (teamA: Team, teamB: Team) => number {
  return (teamA, teamB) => {
    if (eventStatus) {
      if (teamA.id === eventStatus.team_id) {
        return -1;
      }
      if (teamB.id === eventStatus.team_id) {
        return 1;
      }
    }
    return teamA.id - teamB.id;
  };
}

export function TwitchPage() {
  usePageSEO('streams');
  const { currentEvent } = useContext(GlobalStateContext);
  const { users } = useGetUsers(currentEvent.id);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const {
    data: streams,
    isPending: streamsPending,
    isError: streamsError,
  } = useGetStreams(currentEvent.id);
  if (streamsPending) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }
  if (streamsError) {
    return <div className="alert alert-error">Failed to load streams</div>;
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Outlet />
      <h1 className="text-4xl mt-4">Twitch Streams by Team</h1>
      {currentEvent?.teams.sort(teamSort(eventStatus)).map((team) => (
        <div key={`team-video-thumbnails-${team.id}`}>
          <div className="divider divider-primary">{team.name}</div>
          <div className="flex flex-wrap gap-4 justify-left">
            {streams
              .filter((stream) =>
                users?.some(
                  (user) =>
                    user.id === stream.backend_user_id &&
                    user.team_id === team.id
                )
              )
              .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
              .map((stream) => (
                <Link
                  to={"/streams/$twitchAccount"}
                  params={{ twitchAccount: stream.user_login ?? "" }}
                  className="cursor-pointer rounded-field border-2"
                  activeProps={{ className: "border-primary" }}
                >
                  <TwitchStreamEmbed stream={stream} width={340} height={170} />
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
