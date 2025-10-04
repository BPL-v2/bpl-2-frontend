import { useGetEvents } from "@client/query";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";
import Select from "./form/select";

export function EventPicker() {
  const { currentEvent, setCurrentEvent } = useContext(GlobalStateContext);
  const { events, isPending, isError } = useGetEvents();

  if (isPending) {
    return <div>Loading events...</div>;
  }
  if (isError || !events) {
    return <div>Error loading events</div>;
  }

  return (
    <Select
      placeholder="Pick an event"
      // @ts-ignore
      onChange={(v: number) => {
        const event = events.find((event) => event.id === v);
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
      // @ts-ignore
      value={currentEvent.id}
      options={events.map((event) => ({
        label: event.name,
        value: event.id,
      }))}
    ></Select>
  );
}
