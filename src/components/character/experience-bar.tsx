import { getLevelProgress } from "@mytypes/level-info";
import { twMerge } from "tailwind-merge";

interface ExperienceBarProps extends React.HTMLAttributes<HTMLDivElement> {
  experience: number;
  level: number;
  width?: number;
}
export function ExperienceBar({
  experience,
  level,
  width = 80,
  ...props
}: ExperienceBarProps) {
  const progress = getLevelProgress(experience, level);
  return (
    <div
      {...props}
      className={twMerge("flex items-center gap-2", props.className)}
    >
      <span className="">{level}</span>
      <div style={{ width: width }}>
        <progress
          className="progress progress-primary"
          value={progress}
          max="100"
        ></progress>
      </div>
    </div>
  );
}
