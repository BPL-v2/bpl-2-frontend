import { GameVersion, ObjectiveType } from "@client/api";
import { useGetEvents, useGetPoBs, useGetUser } from "@client/query";
import { LazyCharacterChart } from "@components/character-chart-lazy";
import { ObjectiveIcon } from "@components/objective-icon";
import { PoB } from "@components/pob";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { flatMap } from "@utils/utils";
import { Suspense, useContext, useEffect, useState } from "react";

function getDeltaTimeAfterLeagueStart(
  timestamp?: string,
  leagueStart?: string
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
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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
});

function RouteComponent() {
  const { scores } = useContext(GlobalStateContext);
  const { userId, characterId, eventId } = useParams({ from: Route.id });
  const { user } = useGetUser();
  const { events = [] } = useGetEvents();
  const event = events.find((e) => e.id === Number(eventId));
  const { pobs = [] } = useGetPoBs(userId, characterId);
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
    <div className="w-full flex flex-col gap-4  px-2">
      {contributions.length > 0 && user?.id === userId && (
        <div className="bg-base-300 rounded-box p-4 flex flex-col gap-4">
          <h1 className="text-xl text-left">
            Item contributions:{" "}
            <span className="text-success">
              +{contributions.reduce((acc, curr) => acc + curr.score.points, 0)}
            </span>
          </h1>
          <div className="flex flex-row gap-4 flex-wrap">
            {contributions
              .sort((a, b) => b.score.points - a.score.points)
              .map((contribution) => {
                return (
                  <div className="tooltip">
                    <div className="tooltip-content p-2 font-bold bg-base-100">
                      <div className="">{contribution.objective.name}</div>
                      <span>
                        {new Date(
                          contribution.score.timestamp
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
            className="range range-primary w-full  md:range-xl [--range-thumb:blue]"
            min="0"
            max={pobs?.length ? pobs.length - 1 : 0}
            value={pobId}
            onChange={(e) => setPobId(Number(e.target.value))}
          />
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-primary-content pointer-events-none select-none text-xs md:text-md"
            style={{ zIndex: 2 }}
          >
            {getDeltaTimeAfterLeagueStart(
              pobs[pobId]?.timestamp,
              event?.event_start_time
            )}
          </span>
        </div>
      )}
      {pobs.length > 0 && <PoB pobString={pobs[pobId].export_string} />}
      <Suspense
        fallback={
          <div className="bg-base-200 rounded-box justify-center p-8">
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
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
