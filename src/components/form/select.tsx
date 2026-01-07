import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

export type SelectOption<T> = {
  label: string;
  value: T;
};

type SelectProps<T> = {
  name?: string;
  options: T[] | SelectOption<T>[];
  value?: T | null;
  onChange?: (value: NoInfer<NonNullable<T> | null> | null) => void;
  className?: string;
  placeholder?: string;
  fontSize?: string;
  required?: boolean;
};

export default function Select<T>({
  name,
  options,
  onChange,
  placeholder,
  required = false,
  fontSize = "text-sm",
  className = "",
  value,
}: SelectProps<T>) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectOption<T> | undefined>(
    value ? { label: value.toString(), value: value as T } : undefined,
  );
  const cleanOptions = useMemo(() => {
    if (!options || options.length === 0) {
      return [];
    }
    if (typeof options[0] === "object") {
      return options as SelectOption<T>[];
    }
    return options.map(
      (option) =>
        ({
          label: option as string,
          value: option as T,
        }) as SelectOption<T>,
    );
  }, [options]);

  useEffect(() => {
    if (value === null || value === undefined) {
      setSelected(undefined);
    }
    if (value) {
      setSelected(cleanOptions.find((option) => option.value === value));
    }
  }, [value]);

  const filtered =
    query === ""
      ? cleanOptions
      : cleanOptions.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <div className={twMerge(fontSize, className)}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={String(selected?.value) || ""}
          required={required}
        />
      )}
      <Combobox
        value={selected?.value || null}
        onChange={(value) => {
          setSelected(cleanOptions.find((o) => o.value === value));
          if (onChange) onChange(value);
        }}
        onClose={() => setQuery("")}
        name={name}
      >
        <ComboboxButton className="w-full" name={name}>
          <ComboboxInput
            className={twMerge("select w-full", fontSize, className)}
            displayValue={() => selected?.label || ""}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={placeholder}
            name={name}
            required={required}
            autoComplete="off"
          />
        </ComboboxButton>
        <ComboboxOptions
          anchor="bottom"
          className="z-1000 w-(--input-width) rounded-box border-2 border-gray-200 bg-base-100 p-1"
        >
          {selected && !required && (
            <ComboboxOption
              value={null}
              className="group cursor-pointer rounded-lg px-3 py-2 text-error select-none data-focus:bg-error data-focus:text-error-content"
            >
              Clear Selection
            </ComboboxOption>
          )}
          {filtered.map((option, idx) => (
            <ComboboxOption
              key={name + "-option-" + idx}
              value={option.value}
              className="group cursor-pointer rounded-lg px-3 py-2 select-none hover:bg-base-300 data-selected:bg-primary data-selected:text-primary-content"
            >
              {option.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
