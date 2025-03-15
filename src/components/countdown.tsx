import React from "react";

interface CountdownProps {
  target: Date;
  onEnd?: () => void;
  size?: "small" | "default" | "large";
}

export function Countdown({ target, onEnd, size }: CountdownProps) {
  const diff = target.getTime() - new Date().getTime();

  const [days, setDays] = React.useState(
    Math.floor(diff / (1000 * 60 * 60 * 24))
  );
  const [hours, setHours] = React.useState(
    Math.floor((diff / (1000 * 60 * 60)) % 24)
  );
  const [minutes, setMinutes] = React.useState(
    Math.floor((diff / 1000 / 60) % 60)
  );
  const [seconds, setSeconds] = React.useState(Math.floor((diff / 1000) % 60));

  React.useEffect(() => {
    const interval = setInterval(() => {
      const diff = target.getTime() - new Date().getTime();
      if (diff <= 0) {
        clearInterval(interval);
        onEnd?.();
      } else {
        setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((diff / 1000 / 60) % 60));
        setSeconds(Math.floor((diff / 1000) % 60));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);
  let numberSize = "text-3xl";
  let textSize = "text-md";
  switch (size) {
    case "small":
      numberSize = "text-xl";
      textSize = "text-sm";
      break;
    case "large":
      numberSize = "text-5xl";
      textSize = "text-xl";
      break;
    case "default":
    default:
      break;
  }

  return (
    <div
      className={`grid grid-flow-col gap-5 text-center auto-cols-max ${textSize}`}
    >
      {days > 0 && (
        <div className="flex flex-col">
          <span className={`countdown font-mono ${numberSize}`}>
            <span
              style={{ "--value": Math.min(days, 99) } as React.CSSProperties}
              aria-live="polite"
              aria-label={"days"}
            >
              {days}
            </span>
          </span>
          days
        </div>
      )}
      <div className="flex flex-col">
        <span className={`countdown font-mono ${numberSize}`}>
          <span
            style={{ "--value": hours } as React.CSSProperties}
            aria-live="polite"
            aria-label={"hours"}
          >
            {hours}
          </span>
        </span>
        hours
      </div>
      <div className="flex flex-col">
        <span className={`countdown font-mono ${numberSize}`}>
          <span
            style={{ "--value": minutes } as React.CSSProperties}
            aria-live="polite"
            aria-label={"minutes"}
          >
            {minutes}
          </span>
        </span>
        min
      </div>
      <div className="flex flex-col">
        <span className={`countdown font-mono ${numberSize}`}>
          <span
            style={{ "--value": seconds } as React.CSSProperties}
            aria-live="polite"
            aria-label={"seconds"}
          >
            {seconds}
          </span>
        </span>
        sec
      </div>
    </div>
  );
}
