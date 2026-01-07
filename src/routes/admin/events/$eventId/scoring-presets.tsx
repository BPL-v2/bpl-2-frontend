import { createFileRoute } from "@tanstack/react-router";

import {
  Permission,
  ScoringMethod,
  ScoringPreset,
  ScoringPresetCreate,
} from "@client/api";
import {
  useAddScoringPreset,
  useDeleteScoringPreset,
  useGetEvents,
  useGetScoringPresetsForEvent,
} from "@client/query";
import { Dialog } from "@components/dialog";
import { setFormValues, useAppForm } from "@components/form/context";
import Table from "@components/table/table";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/events/$eventId/scoring-presets")({
  component: renderConditionally(ScoringPresetsPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),

  params: {
    parse: (params) => ({
      eventId: Number(params.eventId),
    }),
    stringify: (params) => ({
      eventId: params.eventId.toString(),
    }),
  },
});

function pointsRenderer(points: number[]) {
  if (points.length === 1) {
    return points[0];
  }
  const val2Count = new Map<number, number>();
  points.forEach((val) => {
    val2Count.set(val, (val2Count.get(val) || 0) + 1);
  });
  let out = "[";
  for (const [val, count] of val2Count.entries()) {
    if (count === 1) {
      out += `${val}, `;
    } else {
      out += `${val}x${count}, `;
    }
  }
  return out.slice(0, -2) + "]";
}

function ScoringPresetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { eventId } = useParams({ from: Route.id });
  const { events } = useGetEvents();
  const event = events?.find((event) => event.id === eventId);
  const { scoringPresets } = useGetScoringPresetsForEvent(eventId);
  const qc = useQueryClient();
  const presetForm = useAppForm({
    defaultValues: {
      points: [] as number[],
      extra: {},
    } as ScoringPresetCreate,
    onSubmit: (data) => {
      const create = JSON.parse(
        JSON.stringify(data.value),
      ) as ScoringPresetCreate;
      if (typeof data.value.points === "string") {
        create.points = (data.value.points as never as string)
          .split(",")
          .filter((p) => p.trim())
          .map((point: string) => parseFloat(point.trim()));
      }
      addScoringPreset(create);
    },
  });
  const { addScoringPreset } = useAddScoringPreset(qc, eventId, () => {
    setIsDialogOpen(false);
    presetForm.reset();
  });
  const { deleteScoringPreset } = useDeleteScoringPreset(qc, eventId);

  const { scoring_method } = useStore(
    presetForm.store,
    (state) => state.values,
  );
  const dialog = useMemo(() => {
    return (
      <Dialog
        open={isDialogOpen}
        title={"Create Preset"}
        setOpen={setIsDialogOpen}
        className="max-w-md"
      >
        <form
          className="fieldset w-full rounded-box bg-base-300 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            presetForm.handleSubmit();
          }}
        >
          <presetForm.AppField
            name="name"
            children={(field) => <field.TextField label="Name" required />}
          />
          <presetForm.AppField
            name="points"
            children={(field) => <field.TextField label="Points" required />}
          />
          <presetForm.AppField
            name="scoring_method"
            children={(field) => (
              <field.SelectField
                label="Scoring Method"
                options={Object.values(ScoringMethod)}
                required
              />
            )}
          />
          <presetForm.AppField
            name="extra.required_number_of_bingos"
            children={(field) => (
              <field.TextField
                label="Required Number of Bingos"
                hidden={scoring_method !== ScoringMethod.BINGO_BOARD}
              />
            )}
          />
          {scoring_method === ScoringMethod.RANKED_COMPLETION_TIME && (
            <div className="flex flex-col gap-1 rounded-lg border border-highlight p-2">
              <p className="px-2 text-left text-neutral-content/40">
                Required child completions
              </p>
              <div className="flex flex-row">
                <presetForm.AppField
                  name="extra.required_child_completions"
                  children={(field) => (
                    <field.TextField
                      label="Number"
                      hidden={
                        scoring_method !== ScoringMethod.RANKED_COMPLETION_TIME
                      }
                    />
                  )}
                />

                <presetForm.AppField
                  name="extra.required_child_completions_percent"
                  children={(field) => (
                    <field.TextField
                      label="Percentage"
                      hidden={
                        scoring_method !== ScoringMethod.RANKED_COMPLETION_TIME
                      }
                    />
                  )}
                />
              </div>
            </div>
          )}
          <presetForm.AppField
            name="point_cap"
            children={(field) => (
              <field.NumberField
                label="Point Cap"
                required={scoring_method === ScoringMethod.POINTS_FROM_VALUE}
                hidden={scoring_method !== ScoringMethod.POINTS_FROM_VALUE}
              />
            )}
          />
          <div className="mt-4 flex flex-row justify-end gap-2">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [isDialogOpen, presetForm, scoring_method]);

  if (!eventId || !event) {
    return <div>Event not found</div>;
  }
  const presetColumns: ColumnDef<ScoringPreset>[] = [
    {
      header: "ID",
      accessorKey: "id",
      size: 50,
    },
    {
      header: "Name",
      accessorKey: "name",
      size: 400,
    },
    {
      header: "Description",
      accessorKey: "description",
      size: 400,
    },
    {
      header: "Points",
      accessorKey: "points",
      cell: (info) => pointsRenderer(info.row.original.points),
      size: 150,
    },
    {
      header: "Cap",
      accessorKey: "point_cap",
      cell: (info) =>
        info.row.original.point_cap ? info.row.original.point_cap : "",
      size: 50,
    },
    {
      header: "Scoring Method",
      accessorKey: "scoring_method",
      cell: (info) => info.row.original.scoring_method,
      size: 250,
    },
    {
      header: "Actions",
      cell: (info) => (
        <div className="flex flex-row gap-2">
          <button
            className="btn btn-sm btn-error"
            onClick={() => {
              deleteScoringPreset(info.row.original.id);
            }}
          >
            <TrashIcon className="size-4" />
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => {
              setIsDialogOpen(true);
              setFormValues(presetForm, info.row.original);
            }}
          >
            <PencilSquareIcon className="size-4" />
          </button>
        </div>
      ),
      size: 100,
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <h1>{`Scoring Presets for Event "${event.name}"`}</h1>
      {dialog}
      <button
        className="btn self-center btn-primary"
        onClick={() => {
          setIsDialogOpen(true);
          presetForm.reset();
        }}
      >
        Create Preset
      </button>{" "}
      <Table
        columns={presetColumns}
        data={scoringPresets}
        sortable={false}
        className="h-[80vh] w-full"
      />
    </div>
  );
}

export default ScoringPresetsPage;
