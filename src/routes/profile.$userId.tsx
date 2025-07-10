import { createFileRoute } from "@tanstack/react-router";
import uPlot, { AlignedData } from "uplot";
import "uplot/dist/uPlot.min.css";

import UplotReact from "uplot-react";
import { use, useContext, useEffect, useState } from "react";
import { Character, GameVersion } from "@client/api";
import { GlobalStateContext } from "@utils/context-provider";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { useParams } from "@tanstack/react-router";
import {
  useGetEvents,
  useGetUserById,
  useGetUserCharacters,
  useGetCharacterTimeseries,
} from "@client/query";
import { getLevelFromExperience } from "@mytypes/level-info";
import { PoB } from "@components/pob";
import { characterApi } from "@client/client";

export const Route = createFileRoute("/profile/$userId")({
  component: ProfilePage,
  params: {
    parse: (params) => ({
      userId: Number(params.userId),
    }),
    stringify: (params) => ({
      userId: String(params.userId),
    }),
  },
});

export function ProfilePage() {
  const { preferences, currentEvent } = useContext(GlobalStateContext);
  const { events } = useGetEvents();
  const { userId } = useParams({ from: Route.id });
  const [character, setCharacter] = useState<Character | null>(null);
  const [pobExport, setPobExport] = useState<string>("");

  // Use TanStack Query hooks from query.ts
  const { user } = useGetUserById(userId);
  const { userCharacters = [] } = useGetUserCharacters(userId);
  const { characterTimeseries = [] } = useGetCharacterTimeseries(
    character?.id ?? "",
    userId
  );
  const fontColor = preferences.theme === "dark" ? "white" : "black";
  const fetchPoBExport = (selectedCharacter: Character) => {
    characterApi
      .getPoBExport(userId, selectedCharacter.id)
      .catch((err) => setPobExport(""))
      .then((res) => {
        if (res) setPobExport(res.export_string);
      });
  };

  useEffect(() => {
    if (userCharacters.length > 0) {
      const sortedCharacter = userCharacters.sort(
        (b, a) => a.event_id - b.event_id
      )[0];
      setCharacter(sortedCharacter);
      fetchPoBExport(sortedCharacter);
    } else {
      setCharacter(null);
    }
  }, [userCharacters]);
  const data: AlignedData = [
    new Float64Array(characterTimeseries.map((c) => c.timestamp)),
    new Float64Array(
      characterTimeseries.map((c) => getLevelFromExperience(c.xp))
    ),
    new Float64Array(characterTimeseries.map((c) => c.xp)),
  ];
  const options: uPlot.Options = {
    title: "Level Progression",
    width: 800,
    height: 400,
    legend: {
      show: true,
    },
    axes: [
      {
        side: 2,
        stroke: fontColor,
        ticks: { size: 0 },
      },
      {
        label: "Level",
        side: 3,
        stroke: fontColor,
      },
    ],
    series: [
      {
        label: "",
        points: { show: false },
      },
      {
        label: "LVL",
        stroke: "green",
      },
    ],
    scales: { x: { time: true } },
  };
  const state = {
    options: options,
    data: data,
  };
  if (!userId || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1 className="text-4xl text-center font-bold m-4">
        {user.display_name}'s Profile
      </h1>
      <div className="card bg-base-300 shadow-xl m-4">
        <div className="card-body ">
          <h2 className="card-title text-3xl">Event Characters</h2>
          <div className="flex flex-row flex-wrap justify-center">
            {userCharacters.map((char) => {
              const event = events?.find((e) => e.id == char.event_id);
              if (!event) {
                return null;
              }
              let ascendancyName = char.ascendancy;
              let ascendancyObj;
              if (event.game_version === GameVersion.poe2) {
                ascendancyName =
                  poe2Mapping[char.ascendancy] || char.ascendancy;
                ascendancyObj = ascendancies[GameVersion.poe2][ascendancyName];
              } else {
                ascendancyObj =
                  ascendancies[GameVersion.poe1][
                    phreciaMapping[char.ascendancy] || char.ascendancy
                  ];
              }
              return (
                <div
                  key={char.event_id + char.name}
                  className={`card w-80 h-130 bg-base-200 m-2 shadow-xl cursor-pointer select-none ${
                    char.id === character?.id ? "outline-2 outline-primary" : ""
                  }`}
                  onClick={() => {
                    setCharacter(char);
                    fetchPoBExport(char);
                  }}
                >
                  <figure className="h-80">
                    <img
                      src={ascendancyObj.image}
                      className="h-50"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title text-2xl">{event.name}</h2>
                    <div className="text-lg text-left">
                      <p> {char.name}</p>
                      <p>
                        <span>{char.main_skill}</span>{" "}
                        <span
                          className={`font-bold ${ascendancyObj.classColor}`}
                        >
                          {ascendancyName}
                        </span>
                      </p>
                      <p>Level {char.level}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {character && pobExport && <PoB pobString={pobExport} />}
      {state.data[0].length > 0 ? (
        <div className="flex flex-col items-center bg-base-300 m-4 rounded-box">
          <UplotReact
            className="bg-base-200 rounded-box m-4 p-4 flex justify-center"
            options={state.options}
            data={state.data}
          />
        </div>
      ) : null}
    </>
  );
}
