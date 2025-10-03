import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";
export function ColorField({
  label,
  className,
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string>();
  return (
    <label
      className={twMerge("flex flex-col items-start gap-1", className)}
      hidden={props.hidden}
    >
      <span className="label">{label}</span>
      <input
        type="color"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        className={twMerge("input w-full", className)}
        {...props}
      />
    </label>
  );
}
