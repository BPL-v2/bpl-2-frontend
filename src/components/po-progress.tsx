interface POProgressBarProps {
  checkpoints: number[]; // Array of values defining the sections
  extra: number[];
  current: number; // Current value of the progress bar
  max: number; // Maximum value of the progress bar
}

function POProgressBar({
  checkpoints,
  extra,
  max,
  current,
}: POProgressBarProps) {
  const diff = checkpoints.reduce((a, b) => a - b, current);

  return (
    <div className="flex w-full h-7 bg-base-200 rounded-lg overflow-hidden text-success-content  text-lg">
      {checkpoints
        .filter((value) => value)
        .map((value, index) => (
          <div
            key={index}
            className={`h-full border-r-1 ${index % 2 ? "bg-success/80" : "bg-success/70"} `}
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
