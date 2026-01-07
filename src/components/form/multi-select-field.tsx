import { SelectOption } from "@components/form/select";
import { useFieldContext } from "./context";
import { MultiSelect } from "./multi-select";

export function MultiSelectField<T>({
  label,
  options,
  className,
  ...props
}: {
  label: string;
  options: SelectOption<T>[];
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<T[]>();
  return (
    <div className={className} hidden={props.hidden}>
      <label className={"flex flex-col items-start gap-1"}>
        <span className="label px-2">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <MultiSelect
          className="w-full"
          values={(field.state.value as T[]) || []}
          options={options}
          onChange={(value) => field.handleChange(value)}
          required={!props.hidden && props.required}
        />
      </label>
    </div>
  );
}
