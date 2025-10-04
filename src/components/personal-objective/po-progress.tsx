import { twMerge } from "tailwind-merge";

interface POProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  checkpoints: number[];
  extra: number[];
  current: number;
  max: number;
}

function POProgressBar({
  checkpoints,
  extra,
  max,
  current,
  ...props
}: POProgressBarProps) {
  const diff = checkpoints.reduce((a, b) => a - b, current);

  return (
    <div
      {...props}
      className={twMerge(
        "flex size-full overflow-hidden rounded-lg bg-base-200 text-lg text-success-content",
        props.className,
      )}
    >
      {checkpoints
        .filter((value) => value)
        .map((value, index) => (
          <div
            key={index}
            className={twMerge(
              "h-full min-w-25 border-r-1",
              index % 2 ? "bg-success/80" : "bg-success/70",
            )}
            style={{ width: `${(value / max) * 100}%` }}
          >
            {value} (+{extra[index]})
          </div>
        ))}
      <div
        className="h-full rounded-r-lg border-r-1 bg-success"
        style={{ width: `${(diff / max) * 100}%` }}
      >
        {diff > 0 && diff}
      </div>
    </div>
  );
}

export default POProgressBar;
