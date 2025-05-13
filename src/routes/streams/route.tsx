import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { TwitchStreamEmbed } from "@components/twitch-stream";
import { GlobalStateContext } from "@utils/context-provider";
import { EventStatus, Team, TwitchStream } from "@client/api";
import { streamApi } from "@client/client";

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
  const [twitchStreams, setTwitchStreams] = useState<TwitchStream[]>([]);
  const { eventStatus, users, currentEvent } = useContext(GlobalStateContext);
  useEffect(() => {
    streamApi.getStreams().then(setTwitchStreams);
  }, []);
  return (
    <div className="flex flex-col gap-4 mt-4">
      <Outlet />
      <h1 className="text-4xl mt-4">Twitch Streams by Team</h1>
      {currentEvent?.teams.sort(teamSort(eventStatus)).map((team) => (
        <div key={`team-video-thumbnails-${team.id}`}>
          <div className="divider divider-primary">{team.name}</div>
          <div className="flex flex-wrap gap-4 justify-left">
            {twitchStreams
              .filter((stream) =>
                users.some(
                  (user) =>
                    user.id === stream.backend_user_id &&
                    user.team_id === team.id
                )
              )
              .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
              .map((stream) => (
                <Link
                  to={`/streams/$twitchAccount`}
                  params={{ twitchAccount: stream.user_login ?? "" }}
                  className="cursor-pointer rounded-lg border-2"
                  activeProps={{ className: "border-primary" }}
                  inactiveProps={{ className: "border-transparent" }}
                >
                  <TwitchStreamEmbed stream={stream} width={360} height={180} />
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
