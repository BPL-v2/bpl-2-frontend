import uPlot, { AlignedData } from "uplot";
import "uplot/dist/uPlot.min.css";

import UplotReact from "uplot-react";
import { useContext, useEffect, useState } from "react";
import { Character, GameVersion, User } from "../client";
import { characterApi, userApi } from "../client/client";
import { GlobalStateContext } from "../utils/context-provider";
import { ascendancies, poe2Mapping } from "../types/ascendancy";
import { useParams } from "react-router-dom";

export function ProfilePage() {
  const { darkMode, events, currentEvent } = useContext(GlobalStateContext);
  const [user, setUser] = useState<User>();
  const [eventId, setEventId] = useState<number>(currentEvent?.id || 0);
  const [eventCharacters, setEventCharacters] = useState<Character[]>([]);
  const [characterTimeseries, setCharacterTimeseries] = useState<Character[]>(
    []
  );
  let { userId } = useParams();
  const user_id = userId ? Number(userId) : undefined;

  const fontColor = darkMode ? "white" : "black";
  useEffect(() => {
    if (!user_id) {
      return;
    }
    userApi.getUserById(user_id).then(setUser);
    characterApi.getUserCharacters(user_id).then((res) => {
      setEventCharacters(res);
    });
  }, [user_id]);

  useEffect(() => {
    if (!user_id || !currentEvent) {
      return;
    }
    setEventId(currentEvent.id);
  }, [currentEvent]);

  useEffect(() => {
    if (!user_id) {
      return;
    }
    characterApi
      .getCharacterEventHistoryForUser(eventId, user_id)
      .then((res) => {
        setCharacterTimeseries(
          res.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
      });
  }, [eventId, user_id]);

  function drawVerticalLine(u: uPlot, timestamp: number, label: string) {
    const ctx = u.ctx;
    const xPos = u.valToPos(timestamp, "x") * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(u.bbox.left + xPos, u.bbox.top);
    ctx.lineTo(u.bbox.left + xPos, u.bbox.top + u.bbox.height);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.textRendering = "optimizeLegibility";
    ctx.fillStyle = fontColor;
    ctx.fillText(label, u.bbox.left + xPos, u.bbox.top);
    ctx.closePath();
  }
  const verticalLinePlugin = (): uPlot.Plugin => ({
    hooks: {
      draw: (u: uPlot) => {
        for (const points of [2, 4, 6, 8]) {
          const xVal = characterTimeseries.find(
            (c) => c.ascendancy_points === points
          )?.timestamp;
          if (!xVal) {
            continue;
          }
          drawVerticalLine(
            u,
            new Date(xVal).getTime() / 1000,
            `Asc${points / 2}`
          );
        }
      },
    },
  });

  const data: AlignedData = [
    // xValues: A number array or TypedArray
    new Float64Array(
      characterTimeseries.map((c) => new Date(c.timestamp).getTime() / 1000)
    ),
    new Float64Array(characterTimeseries.map((c) => c.level)),
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
        label: "lvl",
        stroke: "green",
      },
    ],
    scales: { x: { time: true } },
    plugins: [verticalLinePlugin()],
  };
  const state = {
    options: options,
    data: data,
  };
  if (!user_id || !user) {
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
            {eventCharacters.map((character) => {
              const event = events.find((e) => e.id == character.event_id);
              if (!event) {
                return null;
              }
              let ascName = character.ascendancy;
              if (event.game_version === GameVersion.poe2) {
                ascName =
                  poe2Mapping[character.ascendancy] || character.ascendancy;
              }
              const asc = ascendancies[event.game_version][ascName];
              return (
                <div
                  key={character.event_id + character.name}
                  className={`card w-80 h-100 bg-base-200 m-2 shadow-xl cursor-pointer select-none ${
                    event.id === eventId ? "outline-2 outline-primary" : ""
                  }`}
                  onClick={() => setEventId(character.event_id)}
                >
                  <figure className="h-full">
                    <img
                      src={asc.image}
                      alt="Shoes"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // Ensures the image covers the container
                        transform:
                          event.game_version === GameVersion.poe2
                            ? "scale(1.5)"
                            : "",
                      }}
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title text-2xl">{event.name}</h2>
                    <div className="text-lg text-left">
                      <p> {character.name}</p>
                      <p>
                        <span>{character.main_skill}</span>{" "}
                        <span className={`font-bold ${asc.classColor}`}>
                          {ascName}
                        </span>
                      </p>
                      <p>Level {character.level}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
