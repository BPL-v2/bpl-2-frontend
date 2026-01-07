import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface DateTimePickerProps {
  defaultValue?: string;
  label: string;
  name?: string;
  required?: boolean;
  onChange?: (date: string) => void;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  defaultValue,
  label,
  name,
  required,
  onChange,
  className,
}) => {
  const pad = (n: number) => (n < 10 ? `0${n}` : n);

  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("00:00");

  useEffect(() => {
    const getTime = (date: Date | undefined) => {
      if (!date) {
        return "00:00";
      }
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const getDate = (date: Date | undefined) => {
      if (!date) {
        return "";
      }
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
      )}`;
    };
    if (defaultValue) {
      const initialDate =
        typeof defaultValue === "string"
          ? new Date(defaultValue)
          : defaultValue;
      setDate(getDate(initialDate));
      setTime(getTime(initialDate));
    }
  }, [defaultValue]);

  const toIsoString = (time: string, date?: string) => {
    if (!date || !time) {
      return "";
    }
    try {
      return new Date(date + "T" + time).toISOString();
    } catch {
      return "";
    }
  };
  useEffect(() => {
    if (onChange && date && time) {
      onChange(toIsoString(time, date));
    }
  }, [date, time]);

  return (
    <label
      className={twMerge("flex w-full flex-col items-start gap-1", className)}
    >
      <span className="label px-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <div className="join w-full">
        <input
          type="date"
          className="input rounded-l-field"
          name={`${name}-date`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required={required}
        />
        <input
          type="time"
          className="input rounded-r-field"
          name={`${name}-time`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required={required}
        />
        <input type="hidden" name={name} value={toIsoString(time, date)} />
      </div>
    </label>
  );
};
