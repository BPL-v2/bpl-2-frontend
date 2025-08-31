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
        "flex w-full h-7 bg-base-200 rounded-lg overflow-hidden text-success-content text-lg",
        props.className
      )}
    >
      {checkpoints
        .filter((value) => value)
        .map((value, index) => (
          <div
            key={index}
            className={twMerge(
              "h-full border-r-1 min-w-25",
              index % 2 ? "bg-success/80" : "bg-success/70"
            )}
            style={{ width: `${(value / max) * 100}%` }}
          >
            {value} (+{extra[index]})
          </div>
        ))}
      <div
        className="h-full border-r-1 bg-success rounded-r-lg"
        style={{ width: `${(diff / max) * 100}%` }}
      >
        {diff > 0 && diff}
      </div>
    </div>
  );
}

export default POProgressBar;
