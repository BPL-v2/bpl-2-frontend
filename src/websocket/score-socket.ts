import { ScoreDiff } from "@client/api";
import { QueryClient } from "@tanstack/react-query";
import { ScoreMap } from "@utils/utils";

export const establishScoreSocket = (
  eventId: number,
  setScores: (scores: ScoreMap) => void,
  setWebsocket: (ws: WebSocket) => void,
  appendUpdates: (updates: ScoreDiff[]) => void
) => {
  const qc = new QueryClient();
  if (!import.meta.env.VITE_PUBLIC_BPL_BACKEND_URL) {
    console.error("VITE_PUBLIC_BPL_BACKEND_URL is not defined");
    return;
  }
  const url =
    import.meta.env.VITE_PUBLIC_BPL_BACKEND_URL.replace("https", "wss").replace(
      "http",
      "ws"
    ) +
    `/events/${eventId}/scores/ws?token=${localStorage.getItem("auth") || ""}`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("WebSocket connection established", new Date());
  };
  ws.onmessage = (event) => {
    Object.values(JSON.parse(event.data) as ScoreDiff[]).forEach((diff) => {
      if (diff.diff_type !== "Unchanged" && diff.score.finished) {
        if (
          diff.diff_type === "Added" ||
          (diff.field_diff?.includes("Finished") && diff.score.finished)
        ) {
          qc.setQueryData(["score", eventId], (previous: ScoreMap) => {
            if (!previous)
              return { [diff.team_id]: { [diff.objective_id]: diff.score } };
            return {
              ...previous,
              [diff.team_id]: {
                ...previous[diff.team_id],
                [diff.objective_id]: diff.score,
              },
            };
          });
        }
      }
      if (diff.diff_type === "Removed") {
        qc.setQueryData(["score", eventId], (previous: ScoreMap) => {
          if (!previous) return {};
          delete previous[diff.team_id]?.[diff.objective_id];
          return { ...previous };
        });
      } else {
        qc.setQueryData(["score", eventId], (previous: ScoreMap) => {
          if (!previous)
            return { [diff.team_id]: { [diff.objective_id]: diff.score } };
          return {
            ...previous,
            [diff.team_id]: {
              ...previous[diff.team_id],
              [diff.objective_id]: diff.score,
            },
          };
        });
      }
    });
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
