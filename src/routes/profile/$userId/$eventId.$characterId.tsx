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
import { useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
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
  return `${days} days, ${hours} hours, ${minutes} mins`;
}
const formatMetricTick = (val: number, maxMetric: number) => {
  if (maxMetric >= 1_000_000) return (val / 1_000_000).toFixed(1) + " mil";
  if (maxMetric >= 1_000) return (val / 1_000).toFixed(1) + "k";
  return val.toString();
};

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
function drawVerticalLine(u: uPlot, timestamp: number, label: string) {
  const ctx = u.ctx;
  const xPos = u.valToPos(timestamp, "x") * window.devicePixelRatio;
  ctx.beginPath();
  ctx.moveTo(u.bbox.left + xPos, u.bbox.top);
  ctx.lineTo(u.bbox.left + xPos, u.bbox.top + u.bbox.height);
  ctx.strokeStyle = "white";
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.textRendering = "optimizeLegibility";
  ctx.fillStyle = "white";
  ctx.fillText(label, u.bbox.left + xPos, u.bbox.top);
  ctx.closePath();
  ctx.setLineDash([]);
}

function RouteComponent() {
  const { preferences } = useContext(GlobalStateContext);
  const { userId, characterId, eventId } = useParams({ from: Route.id });
  const [selectedMetric, setSelectedMetric] =
    useState<keyof CharacterStat>("dps");
  const plotRef = useRef<HTMLDivElement>(null);

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
  const selectedPobTimestamp = pobs[pobId]?.timestamp
    ? new Date(pobs[pobId].timestamp).getTime() / 1000
    : null;

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

  const verticalLinePlugin = (): uPlot.Plugin => ({
    hooks: {
      draw: (u: uPlot) => {
        if (!selectedPobTimestamp) {
          return;
        }
        drawVerticalLine(u, selectedPobTimestamp, "PoB");
      },
    },
  });

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
        labelFont: "16px sans-serif",
        side: 3,
        stroke: fontColor,
        scale: "lvl",
      },
      {
        label: selectedMetric.toUpperCase().replaceAll("_", " "),
        labelGap: 10,
        labelFont: "",
        side: 1,
        stroke: fontColor,
        scale: "metric",
        values: (self, ticks) =>
          ticks.map((tick) => formatMetricTick(tick, maxMetric)),
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
        label: selectedMetric.toUpperCase().replaceAll("_", " "),
        stroke: "oklch(0.789 0.154 211.53)",
        width: 2,
        fill: "oklch(0.789 0.154 211.53 / 10%)",
        points: {
          size: 8,
          stroke: "oklch(0.789 0.154 211.53)",
          fill: "oklch(0.789 0.154 211.53)",
        },
        scale: "metric",
      },
    ],
    scales: {
      x: {
        time: true,
        range: (self, initMin, initMax) => [
          self.scales.x.min || initMin,
          self.scales.x.max || initMax,
        ],
      },
      lvl: { range: [1, 100] },
      metric: { range: [0, maxMetric] },
    },
    plugins: [verticalLinePlugin()],
  };
  const state = {
    options: options,
    data: data,
  };

  return (
    <div className="w-full m-4 flex flex-col gap-4">
      {pobs.length > 0 && <PoB pobString={pobs[pobId].export_string} />}
      {state.data[0].length > 0 && (
        <div className="bg-base-200 rounded-box justify-center">
          {pobs.length > 0 && (
            <div className="relative flex items-center justify-center m-4 mb-0">
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
          )}
          <div className="flex flex-row bg-base-200 rounded-box justify-center p-4 gap-4">
            <div className="bg-base-300 rounded-box p-4 w-full " ref={plotRef}>
              <UplotReact
                options={state.options}
                data={state.data}
                onCreate={(chart) => {
                  chart.setSize({
                    width: plotRef.current?.clientWidth || 800,
                    height: plotRef.current?.clientHeight || 400,
                  });
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
                      if (
                        pobTimestamp >=
                        state.data[0][closestDataPoint] * 1000
                      ) {
                        setPobId(i);
                        return;
                      }
                    }
                  });
                }}
              />
            </div>
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
                  className={twMerge(
                    "btn m-1",
                    selectedMetric === metric && "btn-primary"
                  )}
                  onClick={() =>
                    setSelectedMetric(metric as keyof CharacterStat)
                  }
                >
                  {metric.toUpperCase().replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
