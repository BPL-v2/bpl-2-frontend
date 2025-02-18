import { ScoreMap } from "../client";
import { ScoreDiffWithKey } from "../types/score";

export const establishScoreSocket = (
  eventId: number,
  setScores: (scores: ScoreMap) => void,
  appendUpdates: (updates: ScoreDiffWithKey[]) => void
) => {
  const url =
    import.meta.env.VITE_BACKEND_URL.replace("https", "ws").replace(
      "http",
      "ws"
    ) + `/events/${eventId}/scores/ws`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("WebSocket connection established", new Date());
  };

  const previousScores: ScoreMap = {};
  ws.onmessage = (event) => {
    console.log("Received new scores");
    const updates: ScoreDiffWithKey[] = [];
    Object.entries(JSON.parse(event.data) as ScoreMap).forEach(
      ([key, value]) => {
        if (value.diff_type !== "Unchanged" && value.score.finished) {
          console.log("key", key, value);
          if (
            value.diff_type === "Added" ||
            (value.field_diff?.includes("Finished") && value.score.finished)
          ) {
            updates.push({ ...value, key: key });
          }
        }
        if (value.diff_type === "Removed") {
          delete previousScores[key];
        } else {
          previousScores[key] = value;
        }
      }
    );
    appendUpdates(updates);
    setScores({ ...previousScores });
  };

  ws.onerror = (error) => {
    console.error("WebSocket error", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed, trying reconnect", new Date());
    // Reconnect
    setTimeout(() => {
      establishScoreSocket(eventId, setScores, appendUpdates);
    }, 10000);
  };
  return ws;
};
