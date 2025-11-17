import { Permission, TimingCreate } from "@client/api";
import { useGetTimings, useSetTimings } from "@client/query";
import { useAppForm } from "@components/form/context";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { renderConditionally } from "@utils/token";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const Route = createFileRoute("/admin/timings")({
  component: renderConditionally(RouteComponent, [Permission.admin]),
});

function formatSeconds(seconds: number): string {
  const d = dayjs.duration(seconds, "seconds");
  const parts: string[] = [];

  if (d.days() > 0) parts.push(`${d.days()} d`);
  if (d.hours() > 0) parts.push(`${d.hours()} h`);
  if (d.minutes() > 0) parts.push(`${d.minutes()} min`);
  if (d.seconds() > 0 || parts.length === 0) parts.push(`${d.seconds()} sec`);

  return parts.join(" ");
}

function RouteComponent() {
  const { timings } = useGetTimings();
  const qc = useQueryClient();
  const { setTimings } = useSetTimings(qc);
  const form = useAppForm({
    defaultValues: timings?.reduce(
      (acc, timing) => {
        acc[timing.key] = timing.duration_seconds;
        return acc;
      },
      {} as Record<string, number>,
    ),
    onSubmit: (data) => {
      const create = Object.entries(data.value).map(
        ([key, duration_seconds]) => ({
          key,
          duration_seconds,
        }),
      ) as TimingCreate[];
      setTimings(create);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <h1 className="m-4 text-4xl font-bold">
        Timings Configuration (in seconds)
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {timings
          ?.sort((a, b) => a.key.localeCompare(b.key))
          .map((timing) => (
            <div
              key={`timing-${timing.key}`}
              className="card bg-base-200 shadow-md"
            >
              <div className="card-body justify-between">
                <h2 className="card-title">{timing.description}</h2>
                <div className="flex flex-row items-center gap-2">
                  <form.AppField
                    name={timing.key}
                    children={(field) => <field.NumberField label="" />}
                  />
                  <div className="w-30 text-right">
                    {formatSeconds(
                      form.state.values[timing.key] ?? timing.duration_seconds,
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <button type="submit" className="btn m-8 btn-primary">
        Save Timings
      </button>
    </form>
  );
}
