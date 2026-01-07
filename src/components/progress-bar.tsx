import { twMerge } from "tailwind-merge";

interface ProgressBarProps extends React.HTMLAttributes<HTMLElement> {
  value: number;
  maxVal: number;
  gotPoints?: boolean;
}

function formatNumbers(num1: number, num2: number): string {
  if (num2 >= 1_000_000) {
    return `${(num1 / 1_000_000).toFixed(1)}M / ${(num2 / 1_000_000).toFixed(num2 % 1_000_000 ? 1 : 0)}M`;
  } else if (num2 >= 1_000) {
    return `${(num1 / 1_000).toFixed(1)}K / ${(num2 / 1_000).toFixed(num2 % 1_000 ? 1 : 0)}K`;
  } else {
    return `${num1} / ${num2}`;
  }
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
          props.className,
        )}
        value={percent}
        max="100"
      ></progress>
      <div
        className={
          gotPoints ? "text-success" : isFinished ? "text-warning" : ""
        }
      >
        {/* dont line break */}
        <span className="whitespace-nowrap">
          {formatNumbers(value, maxVal)}
        </span>
      </div>
    </div>
  );
}
