import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  name?: string;
  options: string[] | SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  fontSize?: string;
  required?: boolean;
};

export default function Select({
  name,
  options,
  value,
  onChange,
  placeholder,
  required = false,
  fontSize = "text-sm",
  className = "",
}: SelectProps) {
  const [query, setQuery] = useState("");
  options =
    typeof options[0] === "string"
      ? options.map(
          (option) =>
            ({
              label: option,
              value: option,
            }) as SelectOption
        )
      : (options as SelectOption[]);

  const [selected, setSelected] = useState(
    options.find((option) => option.value === value) || null
  );
  const filtered =
    query === ""
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <div className={twMerge(fontSize, className)}>
      {name && (
        <input type="hidden" name={name} value={selected?.value || ""} />
      )}
      <Combobox
        value={selected?.value || null}
        onChange={(value) => {
          setSelected(options.find((o) => o.value === value) || null);
          if (onChange) onChange(value || "");
        }}
        onClose={() => setQuery("")}
      >
        <ComboboxButton className={className}>
          <ComboboxInput
            name={name}
            className={twMerge("select", fontSize, className)}
            displayValue={(_) => selected?.label || ""}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={placeholder}
            required={required}
          />
        </ComboboxButton>
        <ComboboxOptions
          anchor="bottom"
          className="w-(--input-width) rounded-box bg-base-100 border-2 border-gray-200 p-1 z-1000"
        >
          {selected && (
            <ComboboxOption
              value={null}
              className="group cursor-pointer rounded-lg px-3 py-2 select-none text-error data-focus:bg-error data-focus:text-error-content"
            >
              Clear Selection
            </ComboboxOption>
          )}
          {filtered.map((option) => (
            <ComboboxOption
              key={option.value}
              value={option.value}
              className="group cursor-pointer rounded-lg px-3 py-2 select-none data-selected:bg-primary data-selected:text-primary-content hover:bg-base-300"
            >
              {option.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
