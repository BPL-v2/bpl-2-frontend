import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { useParams } from "react-router-dom";
import { GlobalStateContext } from "../utils/context-provider";
import { conditionApi, objectiveApi } from "../client/client";
import { Condition, ItemField, Operator, Permission } from "../client";

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
  if (!user || !user.permissions.includes(Permission.admin)) {
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
        objectiveApi
          .getObjective(objectiveIdNum)
          .then((data) => data.conditions)
      }
      createFunction={(data) =>
        conditionApi.createCondition({
          ...data,
          objectiveId: objectiveIdNum,
        })
      }
      // editFunction={async (data) => {
      //   return updateTeam(eventIdNum, data);
      // }}
      deleteFunction={(data) => conditionApi.deleteCondition(data.id)}
    />
  );
};

export default ConditionPage;
