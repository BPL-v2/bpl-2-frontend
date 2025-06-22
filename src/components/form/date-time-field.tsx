import { DateTimePicker } from "@components/datetime-picker";
import { useFieldContext } from "./context";
import { twMerge } from "tailwind-merge";

export function DateTimeField({
  label,
  className,
  ...props
}: {
  label: string;
  className?: string;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const field = useFieldContext<string>();
  return (
    <DateTimePicker
      defaultValue={field.state.value}
      label={label}
      onChange={(date) => {
        try {
          field.handleChange(date);
        } catch (_) {}
      }}
      className={twMerge("w-full", className)}
      {...props}
    />
  );
}
