import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import Select from "./select";

export function EventPicker() {
  const { setCurrentEvent, events } = useContext(GlobalStateContext);
  return (
    <Select
      placeholder="Pick an event"
      onChange={(value) => {
        const event = events.find((event) => String(event.id) === value);
        if (event) {
          setCurrentEvent(event);
          return;
        }
        const current = events.find((event) => event.is_current);
        if (current) {
          setCurrentEvent(current);
          return;
        }
      }}
      options={events.map((event) => ({
        label: event.name,
        value: String(event.id),
      }))}
    ></Select>
  );
}
