import { Progress, theme } from "antd";
import { ScoreCategory } from "../types/score";
import { GlobalStateContext } from "../utils/context-provider";
import { useContext } from "react";

export type ProgressAvatarProps = {
  category: ScoreCategory;
  teamId?: number;
  size?: number;
};

export function ProgressAvatar({
  category,
  teamId,
  size,
}: ProgressAvatarProps) {
  const { gameVersion } = useContext(GlobalStateContext);
  const { useToken } = theme;
  const globalToken = useToken().token;
  size = size || 90;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Progress
        type="dashboard"
        percent={
          teamId &&
          (category.team_score[teamId].number /
            (category.objectives.length || 1)) *
            100
        }
        size={size * 1.3}
        steps={category.objectives.length}
        strokeColor={globalToken.colorPrimary}
        trailColor="grey"
        strokeWidth={5}
        showInfo={false}
      />
      <img
        src={`/assets/${gameVersion}/icons/${category.name}.svg`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.9,
          height: size * 0.9,
        }}
      />
    </div>
  );
}
