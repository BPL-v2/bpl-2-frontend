import {
  GameVersion,
  Objective,
  ObjectiveType,
  ObjectiveValidation,
  Permission,
} from "@client/api";
import {
  useGetEvents,
  useGetObjectiveValidations,
  useGetRules,
  useGetScoringPresetsForEvent,
} from "@client/query";
import { ObjectiveIcon } from "@components/objective-icon";
import Table from "@components/table/table";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { flatMap } from "@utils/utils";
import { useMemo } from "react";

export const Route = createFileRoute(
  "/admin/events/$eventId/unvalidated-objectives",
)({
  component: renderConditionally(RouteComponent, [
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

function RouteComponent() {
  const { eventId } = useParams({ from: Route.id });
  const { events } = useGetEvents();
  const { scoringPresets } = useGetScoringPresetsForEvent(eventId);
  const { rules } = useGetRules(eventId);
  const { objectiveValidations } = useGetObjectiveValidations(eventId);
  const event = events?.find((ev) => ev.id === eventId);
  const validationMap = objectiveValidations.reduce(
    (map, validation) => {
      map[validation.objective_id] = validation;
      return map;
    },
    {} as Record<number, ObjectiveValidation>,
  );

  const objectiveColumns: ColumnDef<Objective>[] = useMemo(
    () => [
      {
        header: "",
        accessorKey: "id",
        cell: ({ row }) => {
          return (
            <ObjectiveIcon
              objective={row.original}
              gameVersion={event?.game_version ?? GameVersion.poe1}
            />
          );
        },
        size: 80,
      },
      {
        header: "Name",
        accessorKey: "name",
        size: 200,
      },
      {
        header: "Extra",
        accessorKey: "extra",
        size: 190,
      },
      {
        header: "Num",
        accessorKey: "required_number",
        size: 50,
      },
      {
        header: "Type",
        accessorKey: "objective_type",
        size: 100,
      },
      {
        header: "Aggregation",
        accessorKey: "aggregation",
        size: 180,
      },
      {
        header: "Scoring Method",
        cell: ({ row }) => {
          return scoringPresets
            .filter((preset) =>
              row.original.scoring_presets.map((p) => p.id).includes(preset.id),
            )
            .map((preset) => preset.name)
            .join(", ");
        },
      },
      {
        header: "Conditions",
        accessorKey: "conditions",
        size: 150,
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-1">
              {row.original.conditions.map((condition) => {
                return (
                  <div
                    className="tooltip"
                    key={
                      "condition-" +
                      condition.field +
                      "-" +
                      condition.operator +
                      "-" +
                      condition.value
                    }
                  >
                    <span className="tooltip-content flex flex-row items-center gap-1">
                      <span className="text-success">{condition.field}</span>
                      <span className="text-info">{condition.operator}</span>
                      <span className="text-error">{condition.value}</span>
                    </span>
                    <div className="badge pr-px badge-sm whitespace-nowrap badge-primary select-none">
                      {condition.field}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    ],
    [scoringPresets, event],
  );
  const unvalidatedItems = flatMap(rules).filter(
    (objective) =>
      validationMap[objective.id] === undefined &&
      objective.objective_type === ObjectiveType.ITEM,
  );

  return (
    <Table<Objective>
      className="h-[70vh] w-full"
      columns={objectiveColumns}
      data={unvalidatedItems}
      sortable={false}
    />
  );
}
