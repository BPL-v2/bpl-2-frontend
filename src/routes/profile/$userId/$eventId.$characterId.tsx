import { CharacterStat } from "@client/api";
import {
  useGetCharacterTimeseries,
  useGetEvents,
  useGetPoBs,
} from "@client/query";
import { PoB } from "@components/pob";
import { getLevelFromExperience } from "@mytypes/level-info";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useState } from "react";
import { AlignedData } from "uplot";
import UplotReact from "uplot-react";

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
  return `${days} days, ${hours} hours, ${minutes} minutes`;
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
  const { preferences } = useContext(GlobalStateContext);
  const { userId, characterId, eventId } = useParams({ from: Route.id });
  const [selectedMetric, setSelectedMetric] =
    useState<keyof CharacterStat>("dps");

  const { characterTimeseries = [] } = useGetCharacterTimeseries(
    characterId,
    userId
  );
  const { events = [] } = useGetEvents();
  const event = events.find((e) => e.id === Number(eventId));
  const { pobs = [] } = useGetPoBs(userId, characterId);
  useEffect(() => {
    if (pobs.length > 0) {
      setPobId(pobs.length - 1);
    }
  }, [pobs]);
  const fontColor = preferences.theme === "dark" ? "white" : "black";
  const [pobId, setPobId] = useState<number>(0);

  const data: AlignedData = [
    new Float64Array(characterTimeseries.map((c) => c.timestamp)),
    new Float64Array(
      characterTimeseries.map((c) => getLevelFromExperience(c.xp))
    ),
    new Float64Array(characterTimeseries.map((c) => c[selectedMetric])),
  ];
  const maxMetric = Math.max(
    ...characterTimeseries.map((c) => c[selectedMetric]),
    1
  );

  const options: uPlot.Options = {
    title: "Progression",
    width: 800,
    height: 400,
    legend: { show: true },
    axes: [
      {
        side: 2,
        stroke: fontColor,
        scale: "x",
        ticks: { size: 0 },
      },
      {
        label: "Level",
        side: 3,
        stroke: fontColor,
        scale: "lvl",
      },
      {
        label: selectedMetric.toUpperCase(),
        side: 1,
        stroke: fontColor,
        scale: "dps",
      },
    ],
    series: [
      {
        label: "",
        points: { show: false },
        scale: "x",
      },
      {
        label: "LVL",
        stroke: "oklch(0.841 0.238 128.85)",
        width: 2,
        fill: "oklch(0.841 0.238 128.85 / 10%)",
        points: {
          size: 8,
          stroke: "oklch(0.841 0.238 128.85)",
          fill: "oklch(0.841 0.238 128.85)",
        },
        scale: "lvl",
      },
      {
        label: selectedMetric.toUpperCase().replace("_", " "),
        stroke: "oklch(0.789 0.154 211.53)",
        width: 2,
        fill: "oklch(0.789 0.154 211.53 / 10%)",
        points: {
          size: 8,
          stroke: "oklch(0.789 0.154 211.53)",
          fill: "oklch(0.789 0.154 211.53)",
        },
        scale: "dps",
      },
    ],
    scales: {
      x: { time: true },
      lvl: { range: [1, 100] },
      dps: { range: [0, maxMetric] },
    },
  };
  const state = {
    options: options,
    data: data,
  };

  return (
    <div className="w-full m-4 flex flex-col gap-4">
      <div className="relative w-full flex items-center justify-center my-4">
        <input
          type="range"
          className="range range-primary w-full range-xl [--range-thumb:blue]"
          min="0"
          max={pobs?.length ? pobs.length - 1 : 0}
          value={pobId}
          onChange={(e) => setPobId(Number(e.target.value))}
        />
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-primary-content pointer-events-none select-none"
          style={{ zIndex: 2 }}
        >
          {getDeltaTimeAfterLeagueStart(
            pobs[pobId]?.timestamp,
            event?.event_start_time
          )}
        </span>
      </div>
      {pobs.length > 0 && <PoB pobString={pobs[pobId].export_string} />}
      {state.data[0].length > 0 ? (
        <div className="flex flex-row bg-base-200 rounded-box justify-center p-4 gap-4">
          <UplotReact
            className="bg-base-300 rounded-box p-4"
            options={state.options}
            data={state.data}
            onCreate={(chart) => {
              chart.over.addEventListener("click", (e) => {
                const timestamp = chart.posToVal(e.offsetX, "x");
                let minDiff = Infinity;
                let closestDataPoint: number | null = null;
                for (let i = 0; i < state.data[0].length; i++) {
                  const dataPointTimestamp = state.data[0][i];
                  const diff = Math.abs(dataPointTimestamp - timestamp);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestDataPoint = i;
                  }
                }
                if (closestDataPoint === null) {
                  return;
                }
                for (let i = 0; i < pobs.length; i++) {
                  const pob = pobs[i];
                  const pobTimestamp = new Date(pob.timestamp).getTime();
                  if (pobTimestamp >= state.data[0][closestDataPoint] * 1000) {
                    setPobId(i);
                    return;
                  }
                }
              });
            }}
          />
          <div className="flex flex-col p-4 self-auto bg-base-300 rounded-box">
            Shown Metric:
            {[
              "dps",
              "ehp",
              "hp",
              "mana",
              "es",
              "armour",
              "evasion",
              "ele_max_hit",
              "phys_max_hit",
              "movement_speed",
            ].map((metric) => (
              <button
                key={metric as string}
                className={`btn  m-1 ${
                  selectedMetric === (metric as keyof CharacterStat)
                    ? "btn-primary"
                    : ""
                }`}
                onClick={() => setSelectedMetric(metric as keyof CharacterStat)}
              >
                {metric.toUpperCase().replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
