import { ScoreDiff } from "@client/api";
import { ScoreMap } from "@utils/utils";

export const establishScoreSocket = (
  eventId: number,
  setScores: (scores: ScoreMap) => void,
  setWebsocket: (ws: WebSocket) => void,
  appendUpdates: (updates: ScoreDiff[]) => void
) => {
  if (!import.meta.env.VITE_PUBLIC_BPL_BACKEND_URL) {
    console.error("VITE_PUBLIC_BPL_BACKEND_URL is not defined");
    return;
  }
  const url =
    import.meta.env.VITE_PUBLIC_BPL_BACKEND_URL.replace("https", "wss").replace(
      "http",
      "ws"
    ) + `/events/${eventId}/scores/ws`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("WebSocket connection established", new Date());
  };

  const previousScores: ScoreMap = {};
  ws.onmessage = (event) => {
    console.log("Received new scores", new Date());
    const updates: ScoreDiff[] = [];
    Object.values(JSON.parse(event.data) as ScoreDiff[]).forEach((diff) => {
      if (diff.diff_type !== "Unchanged" && diff.score.finished) {
        if (
          diff.diff_type === "Added" ||
          (diff.field_diff?.includes("Finished") && diff.score.finished)
        ) {
          updates.push(diff);
        }
      }
      if (diff.diff_type === "Removed") {
        if (previousScores[diff.team_id]) {
          delete previousScores[diff.team_id][diff.objective_id];
        }
      } else {
        if (!previousScores[diff.team_id]) {
          previousScores[diff.team_id] = {};
        }
        previousScores[diff.team_id][diff.objective_id] = diff.score;
      }
    });
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
