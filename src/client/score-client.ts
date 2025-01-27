import useSWR from "swr";
import { Score } from "../types/score";
import { fetchWrapper } from "./base";

export const fetchScores = (eventId?: number) => {
  const { data, ...restSWR } = useSWR(
    eventId ? `scores/${eventId}` : null,
    () => fetchWrapper<Score[]>(`/events/${eventId}/scores/latest`, "GET"),
    {
      refreshInterval: 60000,
      revalidateIfStale: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    ...restSWR,
    scoreData: data,
  };
};
