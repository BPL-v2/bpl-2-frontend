import React, { useEffect, useState } from "react";

interface DateTimePickerProps {
  defaultValue?: Date | string;
  label?: string;
  name?: string;
  required?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  defaultValue,
  label,
  name,
  required,
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
        date.getDate()
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
    return new Date(date + "T" + time).toISOString();
  };

  return (
    <>
      {label && <label className="label">{label}</label>}
      <div className="join gap-1 ">
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
    </>
  );
};
