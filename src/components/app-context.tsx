import { useEffect, useState } from "react";
import { ContextProvider } from "@utils/context-provider";
import { establishScoreSocket } from "../websocket/score-socket";
import { hidePOTotal, mergeScores, ScoreMap } from "@utils/utils";
import { ScoringPreset, Event, GameVersion } from "@client/api";
import { ScoreObjective } from "@mytypes/score";
import { initPreferences } from "@mytypes/preferences";
import { useGetEvents, useGetRules, useGetScoringPresets } from "@client/query";

function ContextWrapper({ children }: { children: React.ReactNode }) {
  // initialize with a dummy event so that we can start making api calls
  const [currentEvent, setCurrentEvent] = useState<Event>({
    id: "current",
    gameVersion: GameVersion.poe1,
    teams: [],
  } as unknown as Event);
  const [scoreData, setScoreData] = useState<ScoreMap>({});
  const [scores, setScores] = useState<ScoreObjective>();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  // const [_, setUpdates] = useState<ScoreDiff[]>([]);
  const [preferences, setPreferences] = useState(initPreferences());
  const [websocket, setWebsocket] = useState<WebSocket>();
  const { events } = useGetEvents();
  const { rules } = useGetRules(currentEvent.id);
  const { scoringPresets } = useGetScoringPresets(currentEvent.id);

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
      setScoreData,
      setWebsocket,
      (newUpdates) => {}
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

  useEffect(() => {
    if (rules && scoreData && currentEvent && scoringPresets) {
      const newScores = mergeScores(
        rules,
        scoreData,
        currentEvent?.teams.map((team) => team.id),
        scoringPresets.reduce(
          (acc, preset) => {
            acc[preset.id] = preset;
            return acc;
          },
          {} as Record<number, ScoringPreset>
        )
      );
      setScores(hidePOTotal(newScores));
    }
  }, [rules, scoreData, currentEvent, scoringPresets]);

  useEffect(() => {
    document
      .querySelector("html")
      ?.setAttribute("data-theme", preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }, [preferences]);
  return (
    <>
      <ContextProvider
        value={{
          currentEvent: currentEvent,
          setCurrentEvent: setCurrentEvent,
          scores: scores,
          setScores: setScores,
          isMobile: isMobile,
          setIsMobile: setIsMobile,
          preferences: preferences,
          setPreferences: setPreferences,
        }}
      >
        {children}
      </ContextProvider>
    </>
  );

  return;
}

export default ContextWrapper;
