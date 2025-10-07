import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { twMerge } from "tailwind-merge";

const people = [
  { id: 1, name: "Durward Reynolds" },
  { id: 2, name: "Kenton Towne" },
  { id: 3, name: "Therese Wunsch" },
  { id: 4, name: "Benedict Kessler" },
  { id: 5, name: "Katelyn Rohan" },
];

export default function Example() {
  const [selectedPeople, setSelectedPeople] = useState<typeof people>([]);

  return (
    <Listbox value={selectedPeople} onChange={setSelectedPeople} multiple>
      <div className="">
        <ListboxButton className="select w-40 cursor-pointer"></ListboxButton>
        <ListboxOptions className="rounded-box bg-base-300 p-2">
          {people.map((person) => (
            <ListboxOption
              key={person.id}
              value={person}
              className={twMerge(
                "mt-1 cursor-pointer rounded-xl p-2 text-left select-none hover:bg-primary hover:text-primary-content",
                selectedPeople.includes(person)
                  ? "bg-primary text-primary-content"
                  : "text-base-content",
              )}
            >
              {person.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
