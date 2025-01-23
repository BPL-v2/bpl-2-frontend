import { Card, Tooltip } from "antd";
import { ScoreObjective } from "../types/score";
import { red } from "@ant-design/colors";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import Countdown from "antd/es/statistic/Countdown";
import { fetchCategoryForEvent } from "../client/category-client";
import { CollectionCardTable } from "./collection-card-table";

export type DailyCardProps = {
  objective: ScoreObjective;
};

const dayInMS = 24 * 60 * 60 * 1000;

function validUntilCounter(valid_to: string | null, onFinish: () => void) {
  if (!valid_to) {
    return null;
  }
  if (new Date(valid_to) < new Date()) {
    return "Daily has expired";
  }
  return (
    <Countdown
      format={
        new Date(valid_to).getTime() - new Date().getTime() > dayInMS
          ? "D [days], HH:mm:ss"
          : "HH:mm:ss"
      }
      prefix={"Daily valid until"}
      valueStyle={{ fontSize: "1em" }}
      value={new Date(valid_to).getTime()}
      onFinish={onFinish}
    />
  );
}

export function DailyCard({ objective }: DailyCardProps) {
  const { currentEvent, setRules } = useContext(GlobalStateContext);
  if (!currentEvent) {
    return <></>;
  }
  if (objective.valid_from && new Date(objective.valid_from) > new Date()) {
    return (
      <Card
        key={objective.id}
        title={
          <Tooltip title={objective.extra}>
            <div
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {"Daily not yet available"}
              {objective.extra ? <a style={{ color: red[6] }}>*</a> : null}
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
            new Date(objective.valid_from).getTime() - new Date().getTime() >
            dayInMS
              ? "D [days], HH:mm:ss"
              : "HH:mm:ss"
          }
          title="Daily release in"
          value={new Date(objective.valid_from).getTime()}
          onFinish={() => {
            fetchCategoryForEvent(currentEvent.id).then(setRules);
          }}
        />
      </Card>
    );
  }

  return (
    <Card
      key={objective.id}
      title={
        <Tooltip title={objective.extra}>
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {objective.name}
            {objective.extra ? <a style={{ color: red[6] }}>*</a> : null}
          </div>
        </Tooltip>
      }
      size="small"
      styles={{
        body: {
          // so that the highlight color goes all the way to the edge
          paddingLeft: "0px",
          paddingRight: "0px",
        },
      }}
    >
      <CollectionCardTable objective={objective} />
      {validUntilCounter(objective.valid_to, () => {
        fetchCategoryForEvent(currentEvent.id).then(setRules);
      })}
    </Card>
  );
}
