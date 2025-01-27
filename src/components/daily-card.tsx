import { Card, Tooltip } from "antd";
import { red } from "@ant-design/colors";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import Countdown from "antd/es/statistic/Countdown";
import { fetchCategoryForEvent } from "../client/category-client";
import { CollectionCardTable } from "./collection-card-table";
import { Daily } from "../types/scoring-objective";
import Meta from "antd/es/card/Meta";
import { ObjectiveIcon } from "./objective-icon";

export type DailyCardProps = {
  daily: Daily;
};

const dayInMS = 24 * 60 * 60 * 1000;

function bonusAvailableCounter(
  valid_to: string | null | undefined,
  onFinish: () => void
) {
  if (!valid_to) {
    return null;
  }
  if (new Date(valid_to) < new Date()) {
    return "Bonus points are no longer available";
  }
  return (
    <Countdown
      format={
        new Date(valid_to).getTime() - new Date().getTime() > dayInMS
          ? "D [days], HH:mm:ss"
          : "HH:mm:ss"
      }
      prefix={"Bonus points available until "}
      valueStyle={{ fontSize: "1em" }}
      value={new Date(valid_to).getTime()}
      onFinish={onFinish}
    />
  );
}

export function DailyCard({ daily }: DailyCardProps) {
  const { currentEvent, setRules } = useContext(GlobalStateContext);
  if (!currentEvent || !daily.baseObjective) {
    return <></>;
  }

  const objective = { ...daily.baseObjective };
  if (daily.raceObjective) {
    Object.entries(daily.raceObjective.team_score).forEach(
      ([teamId, score]) => {
        // @ts-ignore
        objective.team_score[teamId].points += score.points;
      }
    );
  }
  if (
    daily.baseObjective.valid_from &&
    new Date(daily.baseObjective.valid_from) > new Date()
  ) {
    return (
      <Card
        key={daily.baseObjective.id}
        title={
          <Tooltip title={daily.baseObjective.extra}>
            <div
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {"Daily not yet available"}
              {daily.baseObjective.extra ? (
                <a style={{ color: red[6] }}>*</a>
              ) : null}
            </div>
          </Tooltip>
        }
        size="small"
        styles={{
          body: {
            height: "auto",
          },
        }}
      >
        <Countdown
          format={
            new Date(daily.baseObjective.valid_from).getTime() -
              new Date().getTime() >
            dayInMS
              ? "D [days], HH:mm:ss"
              : "HH:mm:ss"
          }
          title="Daily release in"
          value={new Date(daily.baseObjective.valid_from).getTime()}
          onFinish={() => {
            fetchCategoryForEvent(currentEvent.id).then(setRules);
          }}
        />
      </Card>
    );
  }
  return (
    <Card
      key={daily.baseObjective.id}
      size="small"
      styles={{
        body: {
          // so that the highlight color goes all the way to the edge
          paddingLeft: "0px",
          paddingRight: "0px",
        },
      }}
    >
      <Meta
        avatar={<ObjectiveIcon objective={daily.baseObjective} />}
        style={{
          height: "100%",
          maxHeight: "60px",
          width: "auto",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
        title={
          <Tooltip title={daily.baseObjective.extra}>
            <div
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {daily.baseObjective.name}
              {daily.baseObjective.extra ? (
                <a style={{ color: red[6] }}>*</a>
              ) : null}
            </div>
          </Tooltip>
        }
      />
      <CollectionCardTable objective={objective} />
      {bonusAvailableCounter(daily.raceObjective?.valid_to, () => {
        fetchCategoryForEvent(currentEvent.id).then(setRules);
      })}
    </Card>
  );
}
