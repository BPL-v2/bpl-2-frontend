import { twMerge } from "tailwind-merge";
import { useRef, useState, useEffect, useCallback } from "react";
import { Event } from "@client/api";

type Props = {
  index: number;
  setIndex: (idx: number) => void;
  timestamps: number[];
  event?: Event;
};
function getDeltaTimeAfterLeagueStart(
  timestamp?: number,
  leagueStart?: number,
) {
  if (!timestamp || !leagueStart) {
    return;
  }
  const milliseconds = timestamp - leagueStart;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} days, ${hours} hours, ${minutes} mins`;
}

export default function PoBSlider({
  index,
  setIndex,
  timestamps,
  event,
}: Props) {
  if (timestamps.length === 0) return null;
  const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
  const progress = ((timestamps[index] - timestamps[0]) / totalDuration) * 100;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const findClosestIndex = useCallback(
    (percentage: number) => {
      const targetTime = timestamps[0] + (totalDuration * percentage) / 100;
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] <= targetTime) {
          return i;
        }
      }
      return 0;
    },
    [timestamps, totalDuration],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const remInPixels = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const adjustedX = e.clientX - rect.left + remInPixels;
      const percentage = Math.max(
        0,
        Math.min(100, (adjustedX / rect.width) * 100),
      );
      const newIndex = findClosestIndex(percentage);
      setIndex(newIndex);
    },
    [findClosestIndex, setIndex],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleBarClick = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const remInPixels = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const adjustedX = e.clientX - rect.left + remInPixels;
    const percentage = Math.max(
      0,
      Math.min(100, (adjustedX / rect.width) * 100),
    );
    const newIndex = findClosestIndex(percentage);
    setIndex(newIndex);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(Math.max(0, index - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex(Math.min(timestamps.length - 1, index + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, setIndex, timestamps.length]);

  return (
    <div
      ref={sliderRef}
      className={twMerge(
        "relative w-full",
        isDragging ? "cursor-grabbing" : "cursor-pointer",
      )}
      onMouseDown={(e) => {
        handleMouseDown(e);
        handleBarClick(e);
      }}
    >
      <span
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded text-xs font-bold text-highlight-content select-none md:text-sm"
        style={{ zIndex: 2 }}
      >
        {getDeltaTimeAfterLeagueStart(
          timestamps[index],
          new Date(event?.event_start_time || 0).getTime(),
        )}
      </span>

      <div className="relative h-8 w-full overflow-hidden rounded-full">
        <div
          className="absolute flex h-full min-w-8 justify-end rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        >
          <div
            className={twMerge(
              "z-1 size-8 rounded-full border-4 border-black/80 bg-primary",
            )}
          />
        </div>
        <div className="absolute top-2 h-4 w-full rounded-full bg-primary/20"></div>
        <div className="absolute inset-0">
          {timestamps.map((timestamp, idx) => {
            const position =
              ((timestamp - timestamps[0]) / totalDuration) * 100;
            return (
              <button
                key={"tick-" + idx}
                className={twMerge(
                  "absolute top-1/2 w-0.5 -translate-y-1/2 bg-white/10",
                  idx < index ? "h-7" : "h-3",
                )}
                style={{ left: `calc(${position}% - 1rem)` }}
                title={new Date(timestamp).toLocaleString()}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
