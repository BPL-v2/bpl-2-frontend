import type { BPLEvent } from "../types/event";
import { fetchWrapper } from "./base";

export class HttpError {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}

export async function fetchCurrentEvent(): Promise<BPLEvent> {
  return await fetchWrapper<BPLEvent>("/events/current", "GET");
}

export async function fetchAllEvents(): Promise<BPLEvent[]> {
  return await fetchWrapper<BPLEvent[]>("/events", "GET");
}

export async function createEvent(data: Partial<BPLEvent>) {
  return await fetchWrapper<BPLEvent>("/events", "PUT", data);
}

export async function deleteEvent(data: Partial<BPLEvent>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>("/events/" + data.id, "DELETE");
}
