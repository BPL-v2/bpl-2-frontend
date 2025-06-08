import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import Select from "./select";
import { useGetEvents } from "@client/query";

export function EventPicker() {
  const { setCurrentEvent } = useContext(GlobalStateContext);
  const { data: events, isPending, isError } = useGetEvents();

  if (isPending) {
    return <div>Loading events...</div>;
  }
  if (isError || !events) {
    return <div>Error loading events</div>;
  }

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
