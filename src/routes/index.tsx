import { createFileRoute } from "@tanstack/react-router";
import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { VideoEmbed } from "@components/video-embed";
import { Countdown } from "@components/countdown";
import { DiscordFilled } from "@icons/discord";
import { HeartIcon } from "@heroicons/react/24/solid";
// import { AscendancyPortrait } from "@components/ascendancy-portrait";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { currentEvent } = useContext(GlobalStateContext);

  const now = Date.now();
  const hasStarted =
    currentEvent && Date.parse(currentEvent.event_start_time) < now;
  const hasEnded =
    currentEvent && Date.parse(currentEvent.event_end_time) < now;

  return (
    <div className="flex flex-col gap-8 mt-8 mx-auto ">
      <div className="card max-w-full bg-base-300">
        <div className="card-body p-12">
          <div className="card-title text-4xl ">What is BPL?</div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-2xl mt-4 text-left">
                BPL is a cooperative, team-based Path of Exile community event
                where players compete to score points in a variety of
                categories. At the end of the event, the team with the most
                points is the victor!
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-8">
                <button className="btn h-16 bg-discord">
                  <a
                    href="https://discord.com/invite/3weG9JACgb"
                    target="_blank"
                    className="text-white text-2xl flex items-center justify-center gap-2"
                  >
                    <DiscordFilled className="w-6 h-6" />
                    Join the Discord
                  </a>
                </button>
                <button className="btn h-16 bg-fuchsia-600">
                  <a
                    href="https://ko-fi.com/bpl_poe"
                    target="_blank"
                    className="text-white text-2xl flex items-center justify-center gap-2"
                  >
                    <HeartIcon className="h-7 w-7" /> Support BPL
                  </a>
                </button>
              </div>
            </div>
            <div className="w-full aspect-video">
              <VideoEmbed url="https://www.youtube.com/watch?v=44WUYiLdeQ4" />
            </div>
          </div>
        </div>
      </div>
      {currentEvent && !hasEnded ? (
        <>
          <div className="card bg-base-300">
            <div className="card-body p-12">
              <div className="card-title text-4xl">Save the Date!</div>
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                <div className="text-2xl mt-4 grid grid-cols-2 text-left">
                  <p>Applications start: </p>
                  <p>
                    {new Date(
                      currentEvent.application_start_time
                    ).toLocaleString()}
                  </p>
                  <p>Start time: </p>
                  <p>
                    {new Date(currentEvent.event_start_time).toLocaleString()}
                  </p>
                  <p>End time: </p>
                  <p>
                    {new Date(currentEvent.event_end_time).toLocaleString()}
                  </p>
                </div>

                {!hasStarted ? (
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-3xl">See you at the Beach in</h3>
                    <Countdown
                      target={new Date(currentEvent.event_start_time)}
                      size="large"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-3xl">Event will end in</h3>
                    <Countdown
                      target={new Date(currentEvent.event_end_time)}
                      size="large"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* TODO: Re-enable once teams have ascendancy splits again */}
          {/* <div className="card bg-base-300">
            <div className="card-body p-12">
              <div className="card-title text-4xl">Meet the Teams</div>
              <p className="text-2xl mt-4">
                The teams only have access to a limited number of Ascendancy
                classes
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                {currentEvent.teams.map((team) => (
                  <div key={team.id} className="card bg-base-200">
                    <div className="card-body">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-center">
                        <img
                          src={`/assets/teams/${
                            currentEvent.id
                          }/${team.name.toLowerCase()}/logo-w-name.svg`}
                          alt={team.name}
                          className="w-full"
                        />
                        <div>
                          <div className="grid grid-cols-4  sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 mt-8">
                            {team.allowed_classes.map((character_class) => (
                              <div
                                key={team.id + character_class}
                                className="tooltip tooltip-primary"
                                data-tip={character_class}
                              >
                                <AscendancyPortrait
                                  character_class={character_class}
                                  className="avatar w-15 h-15 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-full"
                                ></AscendancyPortrait>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </>
      ) : null}
    </div>
  );
}
