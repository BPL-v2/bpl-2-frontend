import { useEffect, useState } from "react";
import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";

export function CommaSeperatedField<T>({
  label,
  className,
  fromString,
  toString,
  ...props
}: {
  label: string;
  fromString: (value: string) => T;
  toString: (value: T) => string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<T[]>();
  const [stringValue, setStringValue] = useState<string>(
    field.state.value?.map(toString).join(",") || ""
  );
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    if (isInitializing && field.state.value.length > 0) {
      setStringValue(field.state.value?.map(toString).join(",") || "");
      setIsInitializing(false);
    }
  }, [field.state.value]);

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
        value={stringValue}
        onChange={(e) => {
          setStringValue(e.target.value);
          field.handleChange(
            e.target.value
              .split(",")
              .filter((v) => v.trim())
              .map(fromString)
          );
        }}
        className={twMerge("input w-full", className)}
        {...props}
      />
    </label>
  );
}
