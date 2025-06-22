import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";

export function NumberField({
  label,
  className,
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<number>();
  return (
    <label
      className="flex flex-col gap-1 items-start w-full"
      hidden={props.hidden}
    >
      <span className="label">
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </span>
      <input
        type="number"
        value={String(field.state.value)}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        className={twMerge("input w-full", className)}
        {...props}
      />
    </label>
  );
}
