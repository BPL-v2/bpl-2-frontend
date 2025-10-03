import Select, { SelectOption } from "@components/select";
import { useFieldContext } from "./context";

export function SelectField<T>({
  label,
  options,
  className,
  ...props
}: {
  label: string;
  options: T[] | SelectOption<T>[];
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<T>();
  return (
    <div className={className} hidden={props.hidden}>
      <label className={"flex flex-col items-start gap-1"}>
        <span className="label">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <Select
          className="w-full"
          value={field.state.value as T}
          options={options}
          onChange={(value) => field.handleChange(value as T)}
          required={!props.hidden && props.required}
        />
      </label>
    </div>
  );
}
