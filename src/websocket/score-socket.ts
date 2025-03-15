import { ScoreMap } from "../client";
import { ScoreDiffWithKey } from "../types/score";

export const establishScoreSocket = (
  eventId: number,
  setScores: (scores: ScoreMap) => void,
  setWebsocket: (ws: WebSocket) => void,
  appendUpdates: (updates: ScoreDiffWithKey[]) => void
) => {
  const url =
    import.meta.env.VITE_BACKEND_URL.replace("https", "wss").replace(
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

  ws.onclose = (ev) => {
    if (ev.code === 1000 && ev.reason === "eventChange") {
      return;
    }
    // in case of unexpected close, try to reconnect
    setTimeout(() => {
      establishScoreSocket(eventId, setScores, setWebsocket, appendUpdates);
    }, 10000);
  };
  setWebsocket(ws);
};
