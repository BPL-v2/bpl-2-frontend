import CrudTable, { CrudColumn } from "../components/crudtable";

import { useParams } from "react-router-dom";
import { Typography } from "antd";
import {
  methodsForType,
  ScoringMethod,
  ScoringPreset,
  ScoringPresetType,
} from "../types/scoring-preset";
import {
  createScoringPreset,
  fetchScoringPresetsForEvent,
} from "../client/scoring-preset-client";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { UserPermission } from "../types/user";

const ScoringPresetsPage: React.FC = () => {
  let { eventId } = useParams();
  if (!eventId) {
    return <div>Event ID not found</div>;
  }
  const { user } = useContext(GlobalStateContext);
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
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
      render: (value) => (
        <Typography.Text>{JSON.stringify(value)}</Typography.Text>
      ),
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
      <Typography.Title level={1}>
        {"Scoring Presets for Event " + eventId}
      </Typography.Title>
      <CrudTable<ScoringPreset>
        resourceName="Scoring Preset"
        columns={scoringPresetsColumns}
        fetchFunction={() => fetchScoringPresetsForEvent(parseInt(eventId))}
        createFunction={async (data) => {
          createScoringPreset(parseInt(eventId), data);
        }}
        editFunction={async (data) => {
          createScoringPreset(parseInt(eventId), data);
        }}
        formValidator={(data) => {
          return data.type &&
            data.scoring_method &&
            methodsForType(data.type).includes(data.scoring_method)
            ? undefined
            : "Invalid method for type " +
                data.type +
                "! Valid methods are: " +
                methodsForType(data.type!).join(", ");
        }}
      ></CrudTable>
    </>
  );
};

export default ScoringPresetsPage;
