import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export type SelectOption<T extends string | number | symbol> = {
  label: string;
  value: T;
};

type SelectProps<T extends string | number | symbol> = {
  name?: string;
  options: SelectOption<T>[];
  percentages: Record<T, number>;
  values: T[];
  onChange: (value: NoInfer<NonNullable<T[]>>) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
};

export function MultiSelectPercentage<T extends string | number | symbol>({
  name,
  options,
  onChange,
  placeholder,
  required = false,
  className = "",
  values,
  percentages,
}: SelectProps<T>) {
  const [query, setQuery] = useState("");
  const filtered = options
    .filter(
      (option) =>
        percentages[option.value] !== undefined &&
        percentages[option.value] > 0 &&
        (query.length < 2 ||
          option.label.toLowerCase().includes(query.toLowerCase())),
    )
    .sort((a, b) => {
      const aSelected = values.includes(a.value);
      const bSelected = values.includes(b.value);
      if (aSelected !== bSelected) {
        return aSelected ? -1 : 1;
      }
      if (aSelected && bSelected) {
        return values.indexOf(a.value) - values.indexOf(b.value);
      }
      const pa = percentages[a.value] ?? 0;
      const pb = percentages[b.value] ?? 0;
      if (pa === pb) {
        return a.label.localeCompare(b.label);
      }
      return pb - pa;
    });
  const valuesInOptions = values.filter((value) =>
    options.some((option) => option.value === value),
  );
  return (
    <Combobox
      multiple
      value={values ?? []}
      onChange={onChange}
      onClose={() => setQuery("")}
    >
      <div className={twMerge("w-full", className, "relative")}>
        <ComboboxButton className="w-full">
          <ComboboxInput
            className={twMerge("w-full", className, "input")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            required={required}
            name={name}
            autoComplete="off"
          />
        </ComboboxButton>
        {valuesInOptions.length > 0 && (
          <XCircleIcon
            className="absolute inset-y-0 right-0 m-2 size-6 cursor-pointer text-base-content/50 hover:text-base-content"
            onClick={() =>
              onChange([
                ...values.filter((value) => !valuesInOptions.includes(value)),
              ])
            }
          />
        )}
      </div>
      {filtered.length > 0 && (
        <ComboboxOptions
          anchor="bottom"
          className="z-1000 flex h-42 w-(--input-width) flex-col gap-1 rounded-box border border-highlight bg-base-300 px-2 py-1"
        >
          {filtered.map((option) => {
            const percentage = (percentages[option.value] ?? 0) * 100;
            return (
              <div className="rounded-lg bg-primary/10 hover:bg-primary/50 hover:text-primary-content">
                <ComboboxOption
                  key={option.value as unknown as string}
                  value={option.value}
                  className="flex w-full cursor-pointer justify-between rounded-lg px-2 py-1 text-left text-sm data-selected:text-primary-content"
                  style={{
                    background: `linear-gradient(to left, var(--color-primary) ${percentage}%, transparent ${percentage}%)`,
                  }}
                >
                  <span className="flex items-center">
                    <CheckIcon
                      className={twMerge(
                        "mr-1 inline size-4",
                        values.includes(option.value) ? "" : "invisible",
                      )}
                    />
                    {option.label}
                  </span>
                  <span>{percentage.toFixed(1)}%</span>
                </ComboboxOption>
              </div>
            );
          })}
        </ComboboxOptions>
      )}
    </Combobox>
  );
}
