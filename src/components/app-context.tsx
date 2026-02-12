import { Event, GameVersion } from "@client/api";
import {
  useGetEvents,
  useGetEventStatus,
  useGetRules,
  useGetScore,
  useGetUser,
  useGetUsers,
} from "@client/query";
import { initPreferences } from "@mytypes/preferences";
import { ScoreObjective } from "@mytypes/score";
import { ContextProvider } from "@utils/context-provider";
import { hidePOTotal, mergeScores, ScoreMap } from "@utils/utils";
import { useEffect, useState } from "react";
import { establishScoreSocket } from "../websocket/score-socket";
import { toTheme } from "./theme-picker";

function ContextWrapper({ children }: { children: React.ReactNode }) {
  // initialize with a dummy event so that we can start making api calls
  const [currentEvent, setCurrentEvent] = useState<Event>({
    id: "current",
    game_version: GameVersion.poe1,
    teams: [],
    uses_medals: false,
  } as unknown as Event);
  const [scoreDiffs, setScoreDiffs] = useState<ScoreMap>({});
  let scores: ScoreObjective | undefined = undefined;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  // const [_, setUpdates] = useState<ScoreDiff[]>([]);
  const [preferences, setPreferences] = useState(initPreferences());
  const [websocket, setWebsocket] = useState<WebSocket>();
  const { events } = useGetEvents();
  const { rules } = useGetRules(currentEvent.id);
  const { score: initialScore = {} } = useGetScore(currentEvent.id);
  useGetUsers(currentEvent.id);
  useGetUser();
  useGetEventStatus(currentEvent.id);

  useEffect(() => {
    // @ts-ignore
    if (events && currentEvent.id === "current") {
      const ev = events.find((event) => event.is_current);
      if (!ev) return;
      // @ts-ignore
      setCurrentEvent({ ...ev, ignoreRefetch: true });
    }
  }, [events]);

  useEffect(() => {
    // @ts-ignore just a manual flag to avoid refetching on initial load
    if (currentEvent.ignoreRefetch) {
      return;
    }
    websocket?.close(1000, "eventChange");
    establishScoreSocket(
      currentEvent.id,
      setScoreDiffs,
      setWebsocket,
      () => {},
      // setUpdates((prevUpdates) => [...newUpdates, ...prevUpdates])
    );
  }, [currentEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (rules && initialScore) {
    const mergedScore = initialScore;
    for (const entry of Object.entries(scoreDiffs)) {
      const teamId = Number(entry[0]);
      const scoreMap = entry[1];
      for (const diffEntry of Object.entries(scoreMap)) {
        const objectId = Number(diffEntry[0]);
        const score = diffEntry[1];
        if (!mergedScore[teamId]) {
          mergedScore[teamId] = {};
        }
        mergedScore[teamId][objectId] = score;
      }
    }
    scores = hidePOTotal(
      mergeScores(
        rules,
        mergedScore,
        currentEvent?.teams.map((team) => team.id),
      ),
    );
  }

  useEffect(() => {
    document
      .querySelector("html")
      ?.setAttribute("data-theme", toTheme(preferences.theme));
  }, [preferences.theme]);

  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }, [preferences]);
  return (
    <ContextProvider
      value={{
        currentEvent: currentEvent,
        setCurrentEvent: setCurrentEvent,
        scores: scores,
        isMobile: isMobile,
        setIsMobile: setIsMobile,
        preferences: preferences,
        setPreferences: setPreferences,
      }}
    >
      {children}
    </ContextProvider>
  );
}

export default ContextWrapper;
