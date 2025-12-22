import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";

export function TextField({
  label,
  className,
  options,
  ...props
}: {
  label: string;
  className?: string;
  options?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string>();
  return (
    <label
      className="flex w-full flex-col items-start gap-1"
      hidden={props.hidden}
    >
      <span className="label">
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </span>
      <input
        type="text"
        list={`${label}-options`}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        className={twMerge("input w-full", className)}
        {...props}
      />
      <datalist id={`${label}-options`}>
        {options?.map((option) => (
          <option value={option} />
        ))}
      </datalist>
    </label>
  );
}
