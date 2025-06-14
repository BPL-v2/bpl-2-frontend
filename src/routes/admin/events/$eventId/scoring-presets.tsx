import { createFileRoute } from "@tanstack/react-router";

import CrudTable, { CrudColumn } from "@components/crudtable";
import {
  Permission,
  ScoringMethod,
  ScoringPreset,
  ScoringPresetType,
} from "@client/api";
import { scoringApi } from "@client/client";
import { useParams } from "@tanstack/react-router";
import { renderConditionally } from "@utils/token";
import { useGetEvents } from "@client/query";

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
  let { eventId } = useParams({ from: Route.id });
  const { data: events } = useGetEvents();
  const event = events?.find((event) => event.id === eventId);

  if (!eventId || !event) {
    return <div>Event not found</div>;
  }

  const scoringPresetsColumns: CrudColumn<ScoringPreset>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      type: "number",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      type: "text",
      editable: true,
      required: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      type: "text",
      editable: true,
      required: false,
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      type: "text",
      editable: true,
      render: pointsRenderer,
      required: true,
    },
    {
      title: "Cap",
      dataIndex: "point_cap",
      key: "point_cap",
      type: "number",
      editable: true,
      required: false,
    },
    {
      title: "Scoring Method",
      dataIndex: "scoring_method",
      key: "scoring_method",
      type: "select",
      options: Object.values(ScoringMethod),
      editable: true,
      required: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      type: "select",
      options: Object.values(ScoringPresetType),
      editable: true,
      required: true,
    },
  ];
  return (
    <>
      <h1>{`Scoring Presets for Event "${event.name}"`}</h1>
      <CrudTable<ScoringPreset>
        resourceName="Scoring Preset"
        columns={scoringPresetsColumns}
        fetchFunction={() => scoringApi.getScoringPresetsForEvent(eventId)}
        createFunction={(data) => {
          const points = data.points
            .split(",")
            .map((point: string) => parseFloat(point.trim()));
          return scoringApi.createScoringPreset(eventId, {
            ...data,
            points: points,
            event_id: eventId,
          });
        }}
        editFunction={(data) => {
          const points = data.points
            .split(",")
            .map((point: string) => parseFloat(point.trim()));
          return scoringApi.createScoringPreset(eventId, {
            ...data,
            points: points,
            event_id: eventId,
          });
        }}
        deleteFunction={(data) =>
          scoringApi.deleteScoringPreset(eventId, data.id)
        }
      ></CrudTable>
    </>
  );
}

export default ScoringPresetsPage;
