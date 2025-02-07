interface ProgressBarProps {
  value: number;
  maxVal: number;
  style?: React.CSSProperties;
}
export function ProgressBar({ value, maxVal, style }: ProgressBarProps) {
  const percent = Math.min((value / maxVal) * 100, 100);
  return (
    <div className="flex items-center" style={style}>
      <progress
        className={`progress w-40 mr-2 ${
          percent < 100 ? "" : "progress-success"
        }`}
        value={percent}
        max="100"
      ></progress>
      <div className={percent < 100 ? undefined : "text-success"}>
        {value}/{maxVal}
      </div>
    </div>
  );
}
