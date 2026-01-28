import { CharacterStat, PoB } from "@client/api";
import { useGetPoBs } from "@client/query";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AlignedData } from "uplot";
import UplotReact from "uplot-react";

function drawVerticalLine(u: uPlot, label: string, timestamp: number) {
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

const formatMetricTick = (val: number, maxMetric: number) => {
  if (maxMetric >= 1_000_000) return (val / 1_000_000).toFixed(1) + " mil";
  if (maxMetric >= 1_000) return (val / 1_000).toFixed(1) + "k";
  return val.toString();
};

export function CharacterChart({
  userId,
  characterId,
  pobId,
  setPobId,
}: {
  userId: number;
  characterId: string;
  pobId: number;
  setPobId: (id: number) => void;
}) {
  const { pobs = [] } = useGetPoBs(userId, characterId);

  const { preferences } = useContext(GlobalStateContext);
  const [selectedMetric, setSelectedMetric] = useState<keyof PoB>("dps");
  const plotRef = useRef<HTMLDivElement>(null);

  const selectedPobTimestamp = pobs[pobId]?.timestamp
    ? new Date(pobs[pobId].timestamp).getTime() / 1000
    : null;

  const fontColor = preferences.theme === "dark" ? "white" : "black";

  const data: AlignedData = [
    new Float64Array(pobs.map((c) => new Date(c.timestamp).getTime() / 1000)),
    new Float64Array(pobs.map((c) => c.level)),
    new Float64Array(pobs.map((c) => c[selectedMetric] as number)),
  ];
  const maxMetric = Math.max(
    ...pobs.map((c) => c[selectedMetric] as number),
    1,
  );

  const verticalLinePlugin = (): uPlot.Plugin => ({
    hooks: {
      draw: (u: uPlot) => {
        if (!selectedPobTimestamp) {
          return;
        }
        drawVerticalLine(u, "PoB", selectedPobTimestamp);
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
    state.data[0].length > 0 && (
      <div className="justify-center rounded-box bg-base-200">
        <div className="hidden flex-row justify-center gap-4 rounded-box bg-base-200 p-4 lg:flex">
          <div className="w-full rounded-box bg-base-300 p-4" ref={plotRef}>
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
          <div className="flex flex-col self-auto rounded-box bg-base-300 p-4">
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
                  selectedMetric === metric && "btn-primary",
                )}
                onClick={() => setSelectedMetric(metric as keyof CharacterStat)}
              >
                {metric.toUpperCase().replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
