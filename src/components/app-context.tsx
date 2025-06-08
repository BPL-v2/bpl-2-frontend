import { useEffect, useState } from "react";
import { ContextProvider } from "@utils/context-provider";
import { establishScoreSocket } from "../websocket/score-socket";
import { mergeScores, ScoreMap } from "@utils/utils";
import { ScoringPreset, Event, GameVersion, ScoreDiff } from "@client/api";
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
  const [gameVersion, setGameVersion] = useState<GameVersion>(GameVersion.poe1);
  const [_, setUpdates] = useState<ScoreDiff[]>([]);
  const [preferences, setPreferences] = useState(initPreferences());
  const [websocket, setWebsocket] = useState<WebSocket>();
  const { data: events } = useGetEvents();
  const { data: rules } = useGetRules(currentEvent.id);
  const { data: scoringPresets } = useGetScoringPresets(currentEvent.id);

  useEffect(() => {
    if (events) {
      const currentEvent = events.find((event) => event.is_current);
      if (!currentEvent) return;
      setCurrentEvent(currentEvent);
    }
  }, [events]);

  useEffect(() => {
    // @ts-ignore just a manual flag to avoid refetching on initial load
    if (currentEvent.ignoreRefetch) {
      return;
    }
    websocket?.close(1000, "eventChange");
    setGameVersion(currentEvent.game_version);
    establishScoreSocket(
      currentEvent.id,
      setScoreData,
      setWebsocket,
      (newUpdates) =>
        setUpdates((prevUpdates) => [...newUpdates, ...prevUpdates])
    );
  }, [currentEvent]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (rules && scoreData && currentEvent && scoringPresets) {
      setScores(
        mergeScores(
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
        )
      );
    }
  }, [rules, scoreData, currentEvent, scoringPresets]);

  useEffect(() => {
    document
      .querySelector("html")
      ?.setAttribute("data-theme", preferences.theme);
  }, []);

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
          gameVersion: gameVersion,
          setGameVersion: setGameVersion,
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
