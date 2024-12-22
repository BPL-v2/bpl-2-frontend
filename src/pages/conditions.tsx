import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { useParams } from "react-router-dom";
import { Condition, ItemField, Operator } from "../types/scoring-objective";
import { getObjectiveById } from "../client/objective-client";
import { createCondition, deleteCondition } from "../client/condition-client";
import { GlobalStateContext } from "../utils/context-provider";
import { UserPermission } from "../types/user";

const columns: CrudColumn<Condition>[] = [
  {
    title: "Field",
    dataIndex: "field",
    key: "field",
    type: "select",
    editable: true,
    options: Object.values(ItemField),
  },
  {
    title: "Operator",
    dataIndex: "operator",
    key: "operator",
    type: "select",
    editable: true,
    options: Object.values(Operator),
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
    type: "text",
    editable: true,
  },
];

const ConditionPage: React.FC = () => {
  const { user } = useContext(GlobalStateContext);
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
    return <div>You do not have permission to view this page</div>;
  }
  let { objectiveId } = useParams();
  if (!objectiveId) {
    return <></>;
  }
  const objectiveIdNum = Number(objectiveId);

  return (
    <CrudTable<Condition>
      resourceName="Condition"
      columns={columns}
      fetchFunction={() =>
        getObjectiveById(objectiveIdNum).then((data) => data.conditions)
      }
      createFunction={async (data) => {
        return createCondition(objectiveIdNum, data);
      }}
      // editFunction={async (data) => {
      //   return updateTeam(eventIdNum, data);
      // }}
      deleteFunction={deleteCondition}
    />
  );
};

export default ConditionPage;
