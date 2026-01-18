import { GameVersion, ObjectiveType } from "@client/api";
import {
  preloadCharacterData,
  useFile,
  useGetEvents,
  useGetPoBs,
  useGetRules,
  useGetScore,
  useGetUser,
  useGetUserActivity,
} from "@client/query";
import { ObjectiveIcon } from "@components/objective-icon";
import { LazyCharacterChart } from "@components/profile/character-chart-lazy";
import { PoB } from "@components/profile/pob";
import PoBSlider from "@components/profile/pob-slider";
import { ScoreObjective } from "@mytypes/score";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import {
  decodePoBExport,
  determineDifferences,
  PathOfBuilding,
} from "@utils/pob";
import { flatMap, lastTimestamp, mergeScores, totalPoints } from "@utils/utils";
import { Suspense, useContext, useEffect, useState } from "react";

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
  const { currentEvent } = useContext(GlobalStateContext);
  const { userId, characterId, eventId } = useParams({ from: Route.id });
  const { user } = useGetUser();
  const { events = [] } = useGetEvents();
  const { activity } = useGetUserActivity(
    eventId,
    user?.id == userId ? userId : 0,
  );
  const { rules } = useGetRules(eventId);
  const { score } = useGetScore(eventId);
  const event = events.find((e) => e.id === Number(eventId));
  let scores: ScoreObjective | undefined = undefined;
  if (rules && score && event)
    scores = mergeScores(
      rules,
      score,
      event.teams.map((team) => team.id),
    );

  const { pobs = [] } = useGetPoBs(userId, characterId);
  const { data: baseTypes = [] } = useFile<string[]>(
    `/assets/${currentEvent.game_version}/items/basetypes.json`,
  );
  const [decodedPobs, setDecodedPobs] = useState<PathOfBuilding[]>([]);

  useEffect(() => {
    if (!baseTypes || baseTypes.length === 0) {
      setDecodedPobs([]);
      return;
    }

    (async () => {
      const decoded: PathOfBuilding[] = [];
      for (const pob of pobs) {
        const dec = await decodePoBExport(pob.export_string, baseTypes);
        if (decoded.length > 0) {
          determineDifferences(decoded[decoded.length - 1], dec);
        }
        decoded.push(dec);
      }
      setDecodedPobs(decoded);
    })();
  }, [pobs, baseTypes]);

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
      if (score.completions[0]?.user_id === userId && totalPoints(score) > 0) {
        contributions.push({ objective: objective, score: score });
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 px-2">
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
              +
              {contributions.reduce(
                (acc, curr) => acc + totalPoints(curr.score),
                0,
              )}
            </span>
          </h1>
          <div className="flex flex-row flex-wrap gap-4">
            {contributions
              .sort(
                (a, b) =>
                  a.score.completions[0]!.timestamp -
                  b.score.completions[0]!.timestamp,
              )
              .map((contribution) => {
                return (
                  <div className="tooltip">
                    <div className="tooltip-content bg-base-100 p-2 font-bold">
                      <div className="">{contribution.objective.name}</div>
                      <span>
                        {new Date(
                          lastTimestamp(contribution.score) * 1000,
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
                        +{totalPoints(contribution.score)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <PoBSlider
        index={pobId}
        setIndex={setPobId}
        timestamps={pobs.map((pob) => Number(new Date(pob.timestamp)))}
        event={event}
      ></PoBSlider>
      {/* {showAtlas && (
        <div className="grid grid-cols-3 gap-2 rounded-box bg-base-300 p-4">
          {[0, 1, 2].map((idx) => {
            var progress =
              atlasProgress.find((ap) => ap.index === idx)?.nodes || [];
            return (
              <Tree
                version={"3.26"}
                nodes={new Set<number>(progress)}
                type="atlas"
                index={idx + 1}
                className="h-full w-full rounded-box bg-base-200"
              />
            );
          })}
        </div>
      )} */}
      {pobs.length > 0 && <PoB pob={decodedPobs[pobId]} />}
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
