import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";
export function BooleanField({
  label,
  className,
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<boolean>();
  return (
    <label
      className={twMerge("flex flex-col items-start gap-1", className)}
      hidden={props.hidden}
    >
      <span className="label px-2">{label}</span>
      <input
        type="checkbox"
        checked={field.state.value}
        onChange={(e) => field.handleChange(e.target.checked)}
        className={twMerge("checkbox", className)}
        {...props}
      />
    </label>
  );
}
