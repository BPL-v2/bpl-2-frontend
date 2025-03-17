import { getLevelProgress } from "../types/level-info";

interface ExperienceBarProps {
  experience: number;
  level: number;
}
export function ExperienceBar({ experience, level }: ExperienceBarProps) {
  const progress = getLevelProgress(experience, level);
  return (
    <div className="flex items-center gap-2">
      {level}
      <div className="w-20">
        <progress
          className="progress progress-primary"
          value={progress}
          max="100"
        ></progress>
      </div>
    </div>
  );
}
