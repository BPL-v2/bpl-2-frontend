import { useEffect, useState } from "react";
import { ContextProvider, defaultPreferences } from "@utils/context-provider";
import { establishScoreSocket } from "../websocket/score-socket";
import { ScoreCategory, ScoreDiffWithKey } from "@mytypes/score";
import { mergeScores } from "@utils/utils";
import {
  Category,
  EventStatus,
  ScoringPreset,
  User,
  Event,
  GameVersion,
  ScoreMap,
  LadderEntry,
} from "@client/api";
import { MinimalTeamUser } from "@mytypes/user";
import { eventApi, ladderApi, scoringApi, userApi } from "@client/client";
import { isLoggedIn } from "@utils/token";

function ContextWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  // initialize with a dummy event so that we can start making api calls
  const [currentEvent, setCurrentEvent] = useState<Event>({
    id: "current",
    teams: [],
  } as unknown as Event);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStatus, setEventStatus] = useState<EventStatus>();
  const [rules, setRules] = useState<Category>();
  const [scoreData, setScoreData] = useState<ScoreMap>({});
  const [scores, setScores] = useState<ScoreCategory>();
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>();
  const [users, setUsers] = useState<MinimalTeamUser[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [gameVersion, setGameVersion] = useState<GameVersion>(GameVersion.poe1);
  const [_, setUpdates] = useState<ScoreDiffWithKey[]>([]);
  const [ladder, setLadder] = useState<LadderEntry[]>([]);
  const [preferences, setPreferences] = useState(
    JSON.parse(
      localStorage.getItem("preferences") || JSON.stringify(defaultPreferences)
    )
  );
  const [websocket, setWebsocket] = useState<WebSocket>();

  useEffect(() => {
    // @ts-ignore just a manual flag to avoid refetching on initial load
    if (currentEvent.ignoreRefetch) {
      return;
    }
    if (isLoggedIn()) {
      userApi.getUser().then(setUser);
    }
    websocket?.close(1000, "eventChange");
    setGameVersion(currentEvent.game_version);
    eventApi.getEventStatus(currentEvent.id).then(setEventStatus);
    establishScoreSocket(
      currentEvent.id,
      setScoreData,
      setWebsocket,
      (newUpdates) =>
        setUpdates((prevUpdates) => [...newUpdates, ...prevUpdates])
    );
    scoringApi.getRulesForEvent(currentEvent.id).then(setRules);
    scoringApi
      .getScoringPresetsForEvent(currentEvent.id)
      .then(setScoringPresets);
    userApi.getUsersForEvent(currentEvent.id).then((users) => {
      setUsers(
        Object.entries(users)
          .map(([teamId, user]) => {
            return user.map((u) => ({ ...u, team_id: parseInt(teamId) }));
          })
          .flat()
      );
    });
    ladderApi.getLadder(currentEvent.id).then(setLadder);
  }, [currentEvent]);

  useEffect(() => {
    eventApi.getEvents().then((events) => {
      setEvents(events);
      const event = events.find((event) => event.is_current);
      if (!event) return;
      // @ts-ignore just a manual flag to avoid refetching on initial load
      setCurrentEvent({ ...event, ignoreRefetch: true });
      setGameVersion(event.game_version);
    });
  }, []);

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
          scoringPresets
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
          user: user,
          setUser: setUser,
          currentEvent: currentEvent,
          setCurrentEvent: setCurrentEvent,
          events: events,
          setEvents: setEvents,
          rules: rules,
          setRules: setRules,
          eventStatus: eventStatus,
          setEventStatus: setEventStatus,
          scores: scores,
          setScores: setScores,
          users: users,
          setUsers: setUsers,
          isMobile: isMobile,
          setIsMobile: setIsMobile,
          gameVersion: gameVersion,
          setGameVersion: setGameVersion,
          ladder: ladder,
          setLadder: setLadder,
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
