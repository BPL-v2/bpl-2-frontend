import { useContext, useEffect, useState } from "react";
import { TwitchStream } from "../types/twitch-stream";
import { fetchStreams } from "../client/twitch-client";
import { TwitchStreamEmbed } from "../components/twitch-stream";
// @ts-ignore: library is not typed
import ReactTwitchEmbedVideo from "react-twitch-embed-video";
import { GlobalStateContext } from "../utils/context-provider";
import { Flex, theme, Typography } from "antd";
import { teamSort } from "../types/team";
const { useToken } = theme;

export function TwitchPage() {
  const [twitchStreams, setTwitchStreams] = useState<TwitchStream[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { eventStatus, users, currentEvent } = useContext(GlobalStateContext);
  const token = useToken().token;
  useEffect(() => {
    fetchStreams().then((data) => setTwitchStreams(data));
  }, []);
  return (
    <div>
      {selectedChannel ? (
        <ReactTwitchEmbedVideo channel={selectedChannel} width={"100%"} />
      ) : null}
      {currentEvent?.teams.sort(teamSort(eventStatus)).map((team) => (
        <>
          <Typography.Title level={3}>{team.name}</Typography.Title>
          <Flex wrap gap="middle" justify="left">
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
                  key={stream.id}
                  onClick={() => setSelectedChannel(stream.user_login)}
                  style={{
                    cursor: "pointer",
                    border: `2px solid ${
                      stream.user_login == selectedChannel
                        ? token.colorPrimary
                        : "transparent"
                    }`,
                    borderRadius: "8px",
                  }}
                >
                  <TwitchStreamEmbed stream={stream} width={360} height={180} />
                </div>
              ))}
          </Flex>
        </>
      ))}
    </div>
  );
}
