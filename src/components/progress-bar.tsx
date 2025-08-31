import { twMerge } from "tailwind-merge";

interface ProgressBarProps extends React.HTMLAttributes<HTMLElement> {
  value: number;
  maxVal: number;
}
export function ProgressBar({ value, maxVal, ...props }: ProgressBarProps) {
  const percent = Math.min((value / maxVal) * 100, 100);
  return (
    <div
      {...props}
      className={twMerge("flex flex-row items-center", props.className)}
    >
      <progress
        className={twMerge(
          "progress mr-2",
          percent >= 100 && "progress-success"
        )}
        value={percent}
        max="100"
      ></progress>
      <div className={percent < 100 ? undefined : "text-success"}>
        {value}/{maxVal}
      </div>
    </div>
  );
}
