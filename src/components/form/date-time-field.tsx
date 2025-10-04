import { DateTimePicker } from "@components/form/datetime-picker";
import { twMerge } from "tailwind-merge";
import { useFieldContext } from "./context";

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
        } catch {
          // ignore
        }
      }}
      className={twMerge("w-full", className)}
      {...props}
    />
  );
}
