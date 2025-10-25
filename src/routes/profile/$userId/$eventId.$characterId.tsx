import { GameVersion, ObjectiveType } from "@client/api";
import {
  preloadCharacterData,
  useGetEvents,
  useGetPoBs,
  useGetUser,
  useGetUserActivity,
} from "@client/query";
import { ObjectiveIcon } from "@components/objective-icon";
import { LazyCharacterChart } from "@components/profile/character-chart-lazy";
import { PoB } from "@components/profile/pob";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { flatMap } from "@utils/utils";
import { Suspense, useContext, useEffect, useState } from "react";

function getDeltaTimeAfterLeagueStart(
  timestamp?: string,
  leagueStart?: string,
) {
  // If either timestamp or league
  if (!timestamp || !leagueStart) {
    return "";
  }
  const ts = new Date(timestamp).getTime();
  const leagueStartDate = new Date(leagueStart).getTime();
  const milliseconds = ts - leagueStartDate;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} days, ${hours} hours, ${minutes} mins`;
}

export const Route = createFileRoute("/profile/$userId/$eventId/$characterId")({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      characterId: params.characterId,
      // @ts-ignore: i just dont get it man...
      userId: Number(params.userId),
      eventId: Number(params.eventId),
    }),
    stringify: (params: {
      userId: number;
      characterId: string;
      eventId: number;
    }) => ({
      characterId: params.characterId,
      userId: String(params.userId),
      eventId: String(params.eventId),
    }),
  },

  loader: async ({
    // @ts-ignore context is not typed
    context: { queryClient },
    params: { userId, characterId, eventId },
  }) => {
    preloadCharacterData(userId, characterId, eventId, queryClient);
  },
});

function RouteComponent() {
  const { scores } = useContext(GlobalStateContext);
  const { userId, characterId, eventId } = useParams({ from: Route.id });
  const { user } = useGetUser();
  const { events = [] } = useGetEvents();
  const { activity } = useGetUserActivity(
    eventId,
    user?.id == userId ? userId : 0,
  );
  const { pobs = [] } = useGetPoBs(userId, characterId);
  const event = events.find((e) => e.id === Number(eventId));

  useEffect(() => {
    if (pobs.length > 0) {
      setPobId(pobs.length - 1);
    }
  }, [pobs]);
  const [pobId, setPobId] = useState<number>(0);

  const contributions = [];
  for (const objective of flatMap(scores)) {
    if (
      objective.objective_type !== ObjectiveType.ITEM ||
      objective.required_number > 1
    )
      continue;
    for (const score of Object.values(objective.team_score)) {
      if (score.user_id === userId && score.points > 0) {
        contributions.push({ objective: objective, score: score });
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      {/* <div className="flex flex-row justify-between gap-2">
        <Tree version={"3.26"} nodes={pob.spec.nodes} type="passives" />
        {[0, 1, 2].map((i) => {
          var progress =
            atlasProgress.find((ap) => ap.index === i)?.nodes || [];
          progress = progress.slice(0, Math.max(0, progress.length - pobId));
          return (
            <Tree
              version={"3.26"}
              nodes={new Set<number>(progress)}
              type="atlas"
              index={i + 1}
            />
          );
        })}
      </div> */}
      {/* <div className="flex flex-col justify-between gap-2">
        {[
          "3.18",
          "3.19",
          "3.20",
          "3.21",
          "3.22",
          "3.23",
          "3.24",
          "3.25",
          "3.26",
        ].map((version) => (
          <Tree
            key={version}
            version={version}
            nodes={pob.spec.nodes}
            type="atlas"
          />
        ))}
      </div> */}
      {activity && eventId > 101 ? (
        <div className="flex">
          <div className="tooltip tooltip-right w-auto text-xl font-bold">
            <div className="tooltip-content flex flex-col gap-2 p-2 text-left font-light">
              <span>
                Measured by taking activity samples when xp changes / items are
                deposited.
              </span>
              <span> Will probably be lower than your /played</span>
            </div>
            Active time:{" "}
            {activity && Math.round((activity / 1000 / 3600) * 10) / 10} hours
            <span className="text-error">*</span>
          </div>
        </div>
      ) : null}
      {contributions.length > 0 && user?.id === userId && (
        <div className="flex flex-col gap-4 rounded-box bg-base-300 p-4">
          <h1 className="text-left text-xl">
            Item contributions:{" "}
            <span className="text-success">
              +{contributions.reduce((acc, curr) => acc + curr.score.points, 0)}
            </span>
          </h1>
          <div className="flex flex-row flex-wrap gap-4">
            {contributions
              .sort((a, b) => b.score.points - a.score.points)
              .map((contribution) => {
                return (
                  <div className="tooltip">
                    <div className="tooltip-content bg-base-100 p-2 font-bold">
                      <div className="">{contribution.objective.name}</div>
                      <span>
                        {new Date(
                          contribution.score.timestamp,
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div
                      className="flex flex-col items-center gap-2"
                      key={contribution.objective.id}
                    >
                      <ObjectiveIcon
                        objective={contribution.objective}
                        gameVersion={GameVersion.poe1}
                      />
                      <p className="text-success">
                        {" "}
                        +{contribution.score.points}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {pobs.length > 0 && (
        <div className="relative flex items-center justify-center">
          <input
            type="range"
            className="range w-full range-primary [--range-thumb:blue] md:range-xl"
            min="0"
            max={pobs?.length ? pobs.length - 1 : 0}
            value={pobId}
            onChange={(e) => setPobId(Number(e.target.value))}
          />
          <span
            className="md:text-md pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-primary-content select-none"
            style={{ zIndex: 2 }}
          >
            {getDeltaTimeAfterLeagueStart(
              pobs[pobId]?.timestamp,
              event?.event_start_time,
            )}
          </span>
        </div>
      )}
      {pobs.length > 0 && <PoB pobString={pobs[pobId]?.export_string} />}
      <Suspense
        fallback={
          <div className="justify-center rounded-box bg-base-200 p-8">
            <div className="flex items-center justify-center">
              <span className="loading loading-lg loading-spinner"></span>
              <span className="ml-2">Loading chart...</span>
            </div>
          </div>
        }
      >
        <LazyCharacterChart
          userId={userId}
          characterId={characterId}
          pobId={pobId}
          setPobId={setPobId}
        />
      </Suspense>
    </div>
  );
}
