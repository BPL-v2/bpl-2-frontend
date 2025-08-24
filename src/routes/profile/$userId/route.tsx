import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import "uplot/dist/uPlot.min.css";

import { useEffect } from "react";
import { GameVersion } from "@client/api";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { useParams } from "@tanstack/react-router";
import {
  useGetEvents,
  useGetUserById,
  useGetUserCharacters,
} from "@client/query";
import { router } from "../../../router";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "@components/carousel-arrows";
import { DotButton, useDotButton } from "@components/carousel-buttons";
import { twMerge } from "tailwind-merge";

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
  const { events } = useGetEvents();
  const { userId } = useParams({ from: Route.id });

  const { user } = useGetUserById(userId);
  const { userCharacters = [] } = useGetUserCharacters(userId);
  // @ts-ignore
  const { characterId } = useParams({ from: Route.fullPath });
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    if (characterId === undefined && userCharacters.length > 0) {
      const sortedCharacter = userCharacters.sort(
        (b, a) => a.event_id - b.event_id
      )[0];
      router.navigate({
        to: "/profile/$userId/$eventId/$characterId",
        params: {
          characterId: sortedCharacter.id,
          userId: userId,
          eventId: sortedCharacter.event_id,
        },
      });
    }
  }, [userCharacters, characterId]);
  if (!userId || !user) {
    return <div>Loading...</div>;
  }
  return (
    <div className=" px-2">
      <h1 className="text-4xl text-center font-bold m-4">
        {user.display_name}'s Profile
      </h1>
      <section className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {userCharacters
              .sort((b, a) => a.event_id - b.event_id)
              .map((char, idx) => {
                const event = events?.find((e) => e.id == char.event_id);
                if (!event) {
                  return null;
                }
                let ascendancyName = char.ascendancy;
                let ascendancyObj;
                if (event.game_version === GameVersion.poe2) {
                  ascendancyName =
                    poe2Mapping[char.ascendancy] || char.ascendancy;
                  ascendancyObj =
                    ascendancies[GameVersion.poe2][ascendancyName];
                } else {
                  ascendancyObj =
                    ascendancies[GameVersion.poe1][
                      phreciaMapping[char.ascendancy] || char.ascendancy
                    ];
                }
                return (
                  <div className="embla__slide" key={char.id}>
                    <Link
                      to={"/profile/$userId/$eventId/$characterId"}
                      params={{
                        characterId: char.id,
                        userId: userId,
                        eventId: char.event_id,
                      }}
                      key={char.event_id + char.name}
                      className={
                        "bg-base-300 cursor-pointer select-none embla__slide flex flex-row gap-4 rounded-full border-2 items-center p-1 "
                      }
                      activeProps={{
                        className: "border-primary shadow-2xl",
                      }}
                      inactiveProps={{
                        className: "border-transparent",
                      }}
                    >
                      <img
                        src={ascendancyObj.thumbnail}
                        className="rounded-full h-22 w-22"
                        alt={ascendancyName}
                      />
                      <div className="bg-base-300 text-left rounded-r-full">
                        <p className=" text-xl font-bold">
                          {event.name.split(" (PL")[0]}
                        </p>
                        <div className="text-lg">
                          <p> {char.name}</p>
                          <div className="flex flex-row gap-2">
                            <span>Level {char.level}</span>
                            <span
                              className={twMerge(
                                "font-bold",
                                ascendancyObj.classColor
                              )}
                            >
                              {ascendancyName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center p-4">
          <div>
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
          <div className="flex-row hidden sm:flex gap-2 flex-wrap justify-end">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                active={index == selectedIndex}
              />
            ))}
          </div>
        </div>
      </section>
      <Outlet />
    </div>
  );
}
