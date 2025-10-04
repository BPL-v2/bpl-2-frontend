import { twMerge } from "tailwind-merge";

type Props = {
  descriptions: string[];
  values: number[];
  cap: number;
};

export function PoGauge({ descriptions, values, cap }: Props) {
  const total = Math.min(
    values.reduce((sum, value) => sum + value, 0),
    cap,
  );
  return (
    <div className="flex items-center gap-2">
      <div className={total > 0 ? "text-success" : ""}>+{total}</div>
      <div
        className="join grid w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${descriptions.length}, minmax(0, 1fr))`,
        }}
      >
        {descriptions.map((description, index) => (
          <div
            key={index}
            className={twMerge(
              "join-item text-center",
              values[index] > 0
                ? "bg-success text-success-content"
                : "bg-base-300",
            )}
          >
            {description}
          </div>
        ))}
      </div>
    </div>
  );
}
