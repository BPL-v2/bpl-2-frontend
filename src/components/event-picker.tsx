import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";

export function EventPicker() {
  const { setCurrentEvent, events } = useContext(GlobalStateContext);

  return (
    <select
      defaultValue="Pick an event"
      className="select w-35 "
      onChange={(e) =>
        setCurrentEvent(
          events.find((event) => String(event.id) === e.target.value)!
        )
      }
    >
      <option disabled={true}>Pick an event</option>
      {events.map((event) => (
        <option key={event.id} value={event.id} data-event={event.id}>
          {event.name}
        </option>
      ))}
    </select>
  );
}
