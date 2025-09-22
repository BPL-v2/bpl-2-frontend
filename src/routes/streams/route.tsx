import {
  Event,
  EventStatus,
  GameVersion,
  LadderEntry,
  Team,
  TwitchStream,
} from "@client/api";
import {
  useGetEventStatus,
  useGetLadder,
  useGetStreams,
  useGetUsers,
} from "@client/query";
import { TwitchStreamEmbed } from "@components/twitch-stream";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { usePageSEO } from "@utils/use-seo";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

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

function CharacterPortrait({
  ladderEntry,
  currentEvent,
}: {
  ladderEntry?: LadderEntry;
  currentEvent: Event;
}) {
  const character = ladderEntry?.character;
  if (!ladderEntry || !character) return null;
  let ascendancyName = character?.ascendancy;
  let ascendancyObj;
  if (currentEvent.game_version === GameVersion.poe2) {
    ascendancyName = poe2Mapping[character.ascendancy] || character.ascendancy;
    ascendancyObj = ascendancies[GameVersion.poe2][ascendancyName];
  } else {
    ascendancyObj =
      ascendancies[GameVersion.poe1][
        phreciaMapping[character.ascendancy] || character.ascendancy
      ];
  }

  return (
    <Link
      to={"/profile/$userId/$eventId/$characterId"}
      params={{
        characterId: character?.id,
        userId: ladderEntry.user_id || 0,
        eventId: currentEvent.id,
      }}
      className={
        "bg-base-300 cursor-pointer select-none flex flex-row gap-4 rounded-t-box border-4 items-center p-1 "
      }
      activeProps={{
        className: "border-primary shadow-2xl",
      }}
      inactiveProps={{
        className: "border-transparent",
      }}
    >
      <img
        src={ascendancyObj.thumbnail}
        className="rounded-full size-14"
        alt={ascendancyName}
      />
      <div className="text-lg text-left">
        <p> {character.name}</p>
        <div className="flex flex-row gap-2">
          <span>Level {character.level}</span>
          <span className={twMerge("font-bold", ascendancyObj.classColor)}>
            {ascendancyName}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TwitchPage() {
  usePageSEO("streams");
  const { currentEvent } = useContext(GlobalStateContext);
  const { users } = useGetUsers(currentEvent.id);
  const { ladder = [] } = useGetLadder(currentEvent.id);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const userToCharacter = ladder.reduce(
    (acc, entry) => {
      if (entry.user_id && entry.character_name) {
        if (acc[entry.user_id] && acc[entry.user_id].level > entry.level) {
          return acc;
        }
        acc[entry.user_id] = entry;
      }
      return acc;
    },
    {} as Record<number, LadderEntry>
  );
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

  const teamStreams = streams
    .map((stream) => {
      const user = users?.find((u) => u.id === stream.backend_user_id);
      if (!user) return null;
      return {
        stream,
        teamId: user.team_id,
        userId: user.id,
      };
    })
    .filter((s) => s !== null)
    .sort((a, b) => (b.stream.viewer_count || 0) - (a.stream.viewer_count || 0))
    .reduce(
      (acc, stream) => {
        if (!acc[stream.teamId]) {
          acc[stream.teamId] = [];
        }
        acc[stream.teamId].push(stream);
        return acc;
      },
      {} as Record<
        number,
        { stream: TwitchStream; teamId: number; userId: number }[]
      >
    );

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Outlet />
      <h1 className="text-4xl mt-4">Twitch Streams by Team</h1>
      {Object.entries(teamStreams)
        .sort((a, b) => {
          const teamA = currentEvent.teams.find((t) => t.id === parseInt(a[0]));
          const teamB = currentEvent.teams.find((t) => t.id === parseInt(b[0]));
          if (teamA && teamB) {
            return teamSort(eventStatus)(teamA, teamB);
          }
          return 0;
        })
        .map(([teamId, streams]) => (
          <div key={`team-video-thumbnails-${teamId}`}>
            <div className="divider divider-primary">
              {currentEvent.teams.find((t) => t.id === parseInt(teamId))
                ?.name || ""}
            </div>
            <div className="flex flex-wrap gap-4 justify-left">
              {streams.map((stream) => {
                streams.map((s) => s.teamId);
                return (
                  <div>
                    <CharacterPortrait
                      ladderEntry={userToCharacter[stream.userId || -1]}
                      currentEvent={currentEvent}
                    />
                    <Link
                      to={"/streams/$twitchAccount"}
                      params={{ twitchAccount: stream.stream.user_login ?? "" }}
                      className="cursor-pointer bg-base-300 "
                      activeProps={{ className: "border-primary" }}
                    >
                      <TwitchStreamEmbed
                        stream={stream.stream}
                        width={340}
                        height={170}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
