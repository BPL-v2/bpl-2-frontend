import { Character, GameVersion } from "@client/api";
import { useGetEvents } from "@client/query";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { twMerge } from "tailwind-merge";

interface ProfileCarouselProps {
  userCharacters: Character[];
  userId: number;
}

export function ProfileCarousel({
  userCharacters,
  userId,
}: ProfileCarouselProps) {
  const { events } = useGetEvents();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });
  // const { selectedIndex, scrollSnaps, onDotButtonClick } =
  //   useDotButton(emblaApi);
  // const {
  //   prevBtnDisabled,
  //   nextBtnDisabled,
  //   onPrevButtonClick,
  //   onNextButtonClick,
  // } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {userCharacters
            .sort((b, a) => a.event_id - b.event_id)
            .map((char) => {
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
                      "bg-base-300 cursor-pointer select-none embla__slide flex flex-row gap-4 rounded-full border-4 items-center p-1 "
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
      {/* <div className="flex flex-row justify-between items-center p-4">
        <div>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
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
      </div> */}
    </section>
  );
}
