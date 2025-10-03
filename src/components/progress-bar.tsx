import { twMerge } from "tailwind-merge";

interface ProgressBarProps extends React.HTMLAttributes<HTMLElement> {
  value: number;
  maxVal: number;
  gotPoints?: boolean;
}
export function ProgressBar({
  value,
  maxVal,
  gotPoints,
  ...props
}: ProgressBarProps) {
  const percent = Math.min((value / maxVal) * 100, 100);
  const isFinished = value >= maxVal;
  return (
    <div
      {...props}
      className={twMerge("flex flex-row items-center", props.className)}
    >
      <progress
        className={twMerge(
          "progress mr-2",
          gotPoints ? "progress-success" : isFinished ? "progress-warning" : "",
        )}
        value={percent}
        max="100"
      ></progress>
      <div
        className={
          gotPoints ? "text-success" : isFinished ? "text-warning" : ""
        }
      >
        {value}/{maxVal}
      </div>
    </div>
  );
}
