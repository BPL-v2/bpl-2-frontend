import { twMerge } from "tailwind-merge";

type Props = {
  descriptions: string[];
  values: number[];
  cap: number;
};

export function PoGauge({ descriptions, values, cap }: Props) {
  const total = Math.min(
    values.reduce((sum, value) => sum + value, 0),
    cap
  );
  return (
    <div className="flex gap-2 items-center">
      <div className={total > 0 ? "text-success" : ""}>+{total}</div>
      <div
        className="grid gap-2 w-full join"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${descriptions.length}, minmax(0, 1fr))`,
        }}
      >
        {descriptions.map((description, index) => (
          <div
            key={index}
            className={twMerge(
              "text-center join-item",
              values[index] > 0
                ? "text-success-content bg-success"
                : "bg-base-300"
            )}
          >
            {description}
          </div>
        ))}
      </div>
    </div>
  );
}
