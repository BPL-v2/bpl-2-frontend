import { CharacterStat } from "@client/api";
import { useGetCharacterTimeseries, useGetPoBs } from "@client/query";
import { PoB } from "@components/pob";
import { getLevelFromExperience } from "@mytypes/level-info";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useState } from "react";
import { AlignedData } from "uplot";
import UplotReact from "uplot-react";

export const Route = createFileRoute("/profile/$userId/$characterId")({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      characterId: params.characterId,
      // @ts-ignore: i just dont get it man...
      userId: Number(params.userId),
    }),
    stringify: (params: { userId: number; characterId: string }) => ({
      characterId: params.characterId,
      userId: String(params.userId),
    }),
  },
});

function RouteComponent() {
  const { preferences } = useContext(GlobalStateContext);
  const { userId, characterId } = useParams({ from: Route.id });
  const [selectedMetric, setSelectedMetric] =
    useState<keyof CharacterStat>("dps");

  const { characterTimeseries = [] } = useGetCharacterTimeseries(
    characterId,
    userId
  );
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
        stroke: "green",
        scale: "lvl",
      },
      {
        label: selectedMetric.toUpperCase().replace("_", " "),
        stroke: "red",
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
      <input
        type="range"
        className="range range-primary w-full"
        min="0"
        max={pobs?.length ? pobs.length - 1 : 0}
        value={pobId}
        onChange={(e) => setPobId(Number(e.target.value))}
      />
      {pobs.length > 0 && <PoB pobString={pobs[pobId].export_string} />}
      {state.data[0].length > 0 ? (
        <div className="flex flex-row bg-base-300  rounded-box justify-center">
          <UplotReact
            className="bg-base-200 rounded-box p-4"
            options={state.options}
            data={state.data}
          />
          <div className="flex flex-col  p-4 self-auto">
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
