import { useContext, useEffect, useState } from "react";
import { TwitchStream } from "../types/twitch-stream";
import { fetchStreams } from "../client/twitch-client";
import { TwitchStreamEmbed } from "../components/twitch-stream";
// @ts-ignore: library is not typed
import ReactTwitchEmbedVideo from "react-twitch-embed-video";
import { GlobalStateContext } from "../utils/context-provider";
import { teamSort } from "../types/team";

export function TwitchPage() {
  const [twitchStreams, setTwitchStreams] = useState<TwitchStream[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { eventStatus, users, currentEvent } = useContext(GlobalStateContext);
  useEffect(() => {
    fetchStreams().then((data) => setTwitchStreams(data));
  }, []);
  return (
    <div key="twitch-page">
      {selectedChannel ? (
        <ReactTwitchEmbedVideo
          key="video"
          channel={selectedChannel}
          width={"100%"}
        />
      ) : null}
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
              .sort((a, b) => b.viewer_count - a.viewer_count)
              .map((stream) => (
                <div
                  key={`stream-${stream.id}`}
                  onClick={() => setSelectedChannel(stream.user_login)}
                  className={`cursor-pointer border-2 rounded-8 ${
                    stream.user_login == selectedChannel
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <TwitchStreamEmbed stream={stream} width={360} height={180} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
