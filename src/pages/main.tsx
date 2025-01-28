import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  Avatar,
  Button,
  Card,
  Space,
  Splitter,
  Tooltip,
  Typography,
} from "antd";
import { VideoEmbed } from "../components/video-embed";
import { DiscordOutlined, HeartOutlined } from "@ant-design/icons";
import Countdown from "antd/es/statistic/Countdown";

function ApplicationStartTimer(applicationStart: string, eventStart: string) {
  const start = new Date(applicationStart);
  const end = new Date(eventStart);
  const now = new Date();
  if (end < now) {
    return <Typography.Title level={3}>Signups are closed!</Typography.Title>;
  }

  if (start < now) {
    return (
      <Countdown
        title={
          <Typography.Title level={3}>Signups are open until</Typography.Title>
        }
        value={eventStart}
        format={countDownFormat(eventStart)}
      />
    );
  }
  return (
    <Countdown
      title={
        <Typography.Title level={3}>Signups will open in</Typography.Title>
      }
      value={applicationStart}
      format={countDownFormat(applicationStart)}
    />
  );
}

function countDownFormat(timeString: string): string {
  return new Date(timeString).getTime() - new Date().getTime() >
    24 * 60 * 60 * 1000
    ? "D [days], HH:mm:ss"
    : "HH:mm:ss";
}

export function MainPage() {
  const { currentEvent, isMobile } = useContext(GlobalStateContext);

  const now = Date.now();

  return (
    <>
      <Card
        style={{ marginTop: "20px" }}
        title={<Typography.Title level={2}>What is BPL?</Typography.Title>}
      >
        <Space direction={isMobile ? "vertical" : "horizontal"}>
          <div>
            <Typography.Paragraph style={{ fontSize: "1.2em" }}>
              BPL is a cooperative, team-based Path of Exile community event
              where players compete to score points in a variety of categories.
              At the end of the event, the team with the most points is the
              victor!
            </Typography.Paragraph>
            <Space
              direction={isMobile ? "vertical" : "horizontal"}
              size="large"
              style={{
                marginTop: "20px",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Button
                style={{
                  fontSize: "1.5em",
                  height: "60px",
                  backgroundColor: "#7289DA",
                }}
                color="purple"
                variant="solid"
                href="https://discord.com/invite/3weG9JACgb"
                target="_blank"
                icon={<DiscordOutlined />}
              >
                Join the Discord
              </Button>
              <Button
                style={{
                  fontSize: "1.5em",
                  height: "60px",
                }}
                color="magenta"
                variant="solid"
                icon={<HeartOutlined />}
                href="https://ko-fi.com/bpl_poe"
                target="_blank"
              >
                Support BPL
              </Button>{" "}
            </Space>
          </div>
          <div
            style={{
              userSelect: "none",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <VideoEmbed
              url="https://www.youtube.com/watch?v=DH-QifEtQtM"
              style={{
                width: isMobile ? "80vw" : "640px",
                height: isMobile ? "50vw" : "360px",
              }}
            />
          </div>
        </Space>
      </Card>
      {currentEvent && Date.parse(currentEvent.event_end_time) > now ? (
        <>
          <Card
            style={{ marginTop: "20px", marginBottom: "20px" }}
            title={
              <Typography.Title level={2}>Save the Date!</Typography.Title>
            }
          >
            <Splitter layout={isMobile ? "vertical" : "horizontal"}>
              <Splitter.Panel resizable={false}>
                {ApplicationStartTimer(
                  currentEvent.application_start_time,
                  currentEvent.event_start_time
                )}
              </Splitter.Panel>
              {Date.parse(currentEvent.event_start_time) > now ? (
                <Splitter.Panel resizable={false}>
                  <Countdown
                    title={
                      <Typography.Title level={3}>
                        See you at the Beach in
                      </Typography.Title>
                    }
                    value={currentEvent.event_start_time}
                    format={countDownFormat(currentEvent.event_start_time)}
                  />
                </Splitter.Panel>
              ) : (
                <Splitter.Panel resizable={false}>
                  <Countdown
                    title={
                      <Typography.Title level={3}>
                        Event will end in
                      </Typography.Title>
                    }
                    format={countDownFormat(currentEvent.event_end_time)}
                    value={currentEvent.event_end_time}
                  />
                </Splitter.Panel>
              )}
            </Splitter>
          </Card>
          <Card
            title={
              <Typography.Title level={2}>Meet the Teams</Typography.Title>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(${
                  isMobile ? 300 : 600
                }px, 1fr))`,
                gap: "8px",
              }}
            >
              {currentEvent.teams.map((team) => (
                <Card key={team.id}>
                  <Space direction={isMobile ? "vertical" : "horizontal"}>
                    <img
                      src={`/assets/teams/${currentEvent.name
                        .toLowerCase()
                        .replaceAll(
                          " ",
                          "_"
                        )}/${team.name.toLowerCase()}/logo-w-name.svg`}
                      alt={team.name}
                      style={{ width: "300px" }}
                    />

                    <div
                      style={{
                        width: "300px",
                      }}
                    >
                      <Typography.Title level={4}>
                        Allowed Ascendancies
                      </Typography.Title>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(80px, 8px))",
                          gap: "8px",
                          justifyItems: "center",
                          alignItems: "center",
                        }}
                      >
                        {team.allowed_classes.map((className) => (
                          <Tooltip title={className}>
                            <Avatar
                              size={80}
                              key={className}
                              shape="circle"
                              src={`/assets/ascendancies/thumbnails/${className.replaceAll(
                                " ",
                                "_"
                              )}.png`}
                            ></Avatar>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </Space>
                </Card>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </>
  );
}
