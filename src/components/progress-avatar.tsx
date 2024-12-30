import { Avatar, Progress, theme } from "antd";
import { ScoreCategory } from "../types/score";

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
  const { useToken } = theme;
  const globalToken = useToken().token;
  size = size || 90;
  return (
    <div
      style={{
        position: "relative",
        width: size, // Adjusted to match the size of the Avatar
        height: size, // Adjusted to match the size of the Avatar
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
        steps={{ count: category.objectives.length, gap: 4 }}
        strokeColor={globalToken.colorPrimary}
        trailColor="grey"
        strokeWidth={5}
        showInfo={false}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />{" "}
      <Avatar
        size={size * 0.9}
        shape="square"
        src={`/assets/icons/${category.name}.svg`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
