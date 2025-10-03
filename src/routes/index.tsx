import { useGetEvents, useGetEventStatus } from "@client/query";
import { AscendancyPortrait } from "@components/ascendancy-portrait";
import { Countdown } from "@components/countdown";
import SignupButton from "@components/signup-button";
import { TeamLogo } from "@components/teamlogo";
// import { VideoEmbed } from "@components/video-embed";
import { HeartIcon } from "@heroicons/react/24/outline";
import { DiscordFilled } from "@icons/discord";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { usePageSEO } from "@utils/use-seo";
import { useContext } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  usePageSEO("home");
  const { currentEvent } = useContext(GlobalStateContext);
  const { events } = useGetEvents();
  const nextEvent =
    events?.sort((a, b) => {
      return (
        (Date.parse(b.event_start_time) || 0) -
        (Date.parse(a.event_start_time) || 0)
      );
    })[0] || currentEvent;
  const { eventStatus } = useGetEventStatus(nextEvent?.id || currentEvent.id);
  const now = Date.now();
  const signupsStart = new Date() >= new Date(nextEvent.application_start_time);
  const hasStarted = Date.parse(nextEvent.event_start_time) < now;
  const hasEnded = Date.parse(nextEvent.event_end_time) < now;
  return (
    <div className="mx-auto mt-8 flex flex-col gap-8">
      {!hasEnded && (
        <div className="card max-w-full bg-base-300">
          <div className="card-body flex flex-row items-center gap-8 px-12 py-4 text-2xl">
            {signupsStart && (
              <>
                <SignupButton />
                <div className="divider divider-horizontal" />
              </>
            )}
            <div>
              Signups: {eventStatus?.number_of_signups || 0} /{" "}
              {nextEvent?.max_size || 0}
            </div>
            <div className="divider divider-horizontal" />
            <div>
              Waitlist:{" "}
              {Math.max(
                (eventStatus?.number_of_signups || 0) -
                  (nextEvent?.max_size || 0),
                0,
              )}{" "}
              / {nextEvent?.waitlist_size || 0}
            </div>
          </div>
        </div>
      )}

      <div className="card max-w-full bg-base-300">
        <div className="card-body p-12">
          <div className="card-title text-4xl">What is BPL?</div>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mt-4 text-left text-2xl">
                BPL is a cooperative, team-based Path of Exile community event
                where players compete to score points in a variety of
                categories. At the end of the event, the team with the most
                points is the victor!
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <button className="bg-discord btn h-16">
                  <a
                    href="https://discord.com/invite/3weG9JACgb"
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-2xl text-white"
                  >
                    <DiscordFilled className="h-6 w-6" />
                    Join the Discord
                  </a>
                </button>
                <button className="btn h-16 bg-fuchsia-600">
                  <a
                    href="https://ko-fi.com/bpl_poe"
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-2xl text-white"
                  >
                    <HeartIcon className="h-7 w-7" /> Support BPL
                  </a>
                </button>
              </div>
            </div>
            {/* <div className="w-full aspect-video">
              <VideoEmbed url="https://www.youtube.com/watch?v=lMBYcR8MGOw" />
            </div> */}
          </div>
        </div>
      </div>
      {nextEvent && !hasEnded ? (
        <>
          <div className="card bg-base-300">
            <div className="card-body p-12">
              <div className="card-title text-4xl">Save the Date!</div>
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="mt-4 grid grid-cols-2 text-left text-2xl">
                  <p>Applications start: </p>
                  <p>
                    {new Date(
                      nextEvent.application_start_time,
                    ).toLocaleString()}
                  </p>
                  <p>Start time: </p>
                  <p>{new Date(nextEvent.event_start_time).toLocaleString()}</p>
                  <p>End time: </p>
                  <p>{new Date(nextEvent.event_end_time).toLocaleString()}</p>
                </div>

                {!hasStarted ? (
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-3xl">See you at the Beach in</h3>
                    <Countdown
                      target={new Date(nextEvent.event_start_time)}
                      size="large"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-3xl">Event will end in</h3>
                    <Countdown
                      target={new Date(nextEvent.event_end_time)}
                      size="large"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {nextEvent.teams.length > 0 && (
            <div className="card bg-base-300">
              <div className="card-body p-12">
                <div className="card-title text-4xl">Meet the Teams</div>
                <p className="mt-4 text-2xl">
                  The teams only have access to a limited number of Ascendancy
                  classes
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {nextEvent.teams.map((team) => (
                    <div key={team.id} className="card bg-base-200">
                      <div className="card-body">
                        <div className="grid h-full grid-cols-1 items-center gap-4 lg:grid-cols-2">
                          <TeamLogo team={team} eventId={nextEvent.id} />
                          <div className="flex flex-row flex-wrap gap-1 md:gap-2">
                            {team.allowed_classes.map((character_class) => (
                              <div
                                key={team.id + character_class}
                                className="tooltip tooltip-primary"
                                data-tip={character_class}
                              >
                                <AscendancyPortrait
                                  character_class={character_class}
                                  className="size-14 rounded-full object-cover xl:size-18"
                                ></AscendancyPortrait>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
