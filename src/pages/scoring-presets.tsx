import CrudTable, { CrudColumn } from "../components/crudtable";

import { useParams } from "react-router-dom";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  Permission,
  ScoringMethod,
  ScoringPreset,
  ScoringPresetType,
} from "../client";
import { scoringApi } from "../client/client";

const ScoringPresetsPage: React.FC = () => {
  const { user, events } = useContext(GlobalStateContext);
  let { eventId } = useParams();
  const event = events.find((event) => event.id === Number(eventId));

  if (!eventId || !event) {
    return <div>Event not found</div>;
  }
  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
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
      render: (value) => <p>{JSON.stringify(value)}</p>,
      required: true,
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
        fetchFunction={() =>
          scoringApi.getScoringPresetsForEvent(parseInt(eventId))
        }
        createFunction={(data) =>
          scoringApi.createScoringPreset({
            ...data,
            event_id: parseInt(eventId),
          })
        }
        editFunction={(data) =>
          scoringApi.createScoringPreset({
            ...data,
            event_id: parseInt(eventId),
          })
        }
        deleteFunction={(data) => scoringApi.deleteScoringPreset(data.id)}
      ></CrudTable>
    </>
  );
};

export default ScoringPresetsPage;
