import useSWR from "swr";
import { Score, ScoreMap } from "../types/score";
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

export const establishScoreSocket = (
  eventId: number,
  setScores: (scores: ScoreMap) => void
) => {
  const url =
    import.meta.env.VITE_BACKEND_URL.replace("http", "ws") +
    `/events/${eventId}/scores/ws`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("WebSocket connection established", new Date());
  };

  const previousScores: ScoreMap = {};
  ws.onmessage = (event) => {
    console.log("Received new scores");
    Object.entries(JSON.parse(event.data) as ScoreMap).forEach(
      ([key, value]) => {
        if (value.diff_type !== "Unchanged") {
          console.log("changed", key, value);
        }

        if (value.diff_type === "Removed") {
          delete previousScores[key];
        } else {
          previousScores[key] = value;
        }
      }
    );
    setScores({ ...previousScores });
  };

  ws.onerror = (error) => {
    console.error("WebSocket error", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed, trying reconnect", new Date());
    // Reconnect
    setTimeout(() => {
      establishScoreSocket(eventId, setScores);
    }, 10000);
  };
  return ws;
};
