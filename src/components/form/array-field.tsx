import { useFieldContext } from "./context";
import { SelectOption } from "@components/select";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function ArrayField({
  label,
  options,
  className,
  ...props
}: {
  label: string;
  options: string[] | SelectOption<string>[];
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string[]>();
  const cleanOptions = useMemo(() => {
    if (!options || options.length === 0) {
      return [];
    }
    if (typeof options[0] === "object") {
      return options as SelectOption<string>[];
    }
    return options.map(
      (option) =>
        ({
          label: option as string,
          value: option as string,
        }) as SelectOption<string>
    );
  }, [options]);
  return (
    <label
      className={twMerge("flex flex-col gap-1 items-start", className)}
      hidden={props.hidden}
    >
      <span className="label">{label}</span>
      <select
        multiple
        className={twMerge("select select-bordered w-full", className)}
        value={field.state.value}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions).map(
            (option) => option.value
          );
          field.handleChange(selectedOptions);
        }}
      >
        {cleanOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
