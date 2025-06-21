import { createFileRoute } from "@tanstack/react-router";
import React, { JSX, useEffect, useMemo, useState } from "react";
import CrudTable, { CrudColumn } from "@components/crudtable";

import { ObjectiveIcon } from "@components/objective-icon";
import {
  Condition,
  ObjectiveCreate,
  Objective,
  ScoringPreset,
  AggregationType,
  GameVersion,
  ItemField,
  NumberField,
  ObjectiveType,
  Operator,
  Permission,
  ScoringPresetType,
} from "@client/api";
import { conditionApi, objectiveApi, scoringApi } from "@client/client";
import { DateTimePicker } from "@components/datetime-picker";
import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@components/dialog";
import { useParams } from "@tanstack/react-router";
import {
  availableAggregationTypes,
  getSubObjective,
  operatorToString,
} from "@mytypes/scoring-objective";
import { renderConditionally } from "@utils/token";
import Select from "@components/select";
import { useGetEvents } from "@client/query";

export const Route = createFileRoute(
  "/admin/events/$eventId/categories/$categoryId"
)({
  component: renderConditionally(ScoringCategoryPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),
  params: {
    parse: (params) => ({
      eventId: Number(params.eventId),
      categoryId: Number(params.categoryId),
    }),
    stringify: (params) => ({
      eventId: params.eventId.toString(),
      categoryId: params.categoryId.toString(),
    }),
  },
});

async function createBulkItemObjectives(
  eventId: number,
  categoryId: number,
  nameList: string,
  scoring_preset_id: number,
  aggregation_method: AggregationType,
  field: ItemField
) {
  const objectives: ObjectiveCreate[] = nameList.split(",").map((name) => {
    return {
      name: name.trim(),
      required_number: 1,
      objective_type: ObjectiveType.ITEM,
      aggregation: aggregation_method,
      number_field: NumberField.STACK_SIZE,
      scoring_preset_id: scoring_preset_id,
      parent_id: categoryId,
      conditions: [
        {
          field: field,
          operator: Operator.EQ,
          value: name,
        },
      ],
    };
  });
  await Promise.all(
    objectives.map((obj) => objectiveApi.createObjective(eventId, obj))
  );
}
export function ScoringCategoryPage(): JSX.Element {
  const { data: events } = useGetEvents();
  const { eventId, categoryId } = useParams({ from: Route.id });
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isBulkObjectiveModalOpen, setIsBulkObjectiveModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>([]);
  const [_, setRefreshObjectives] = useState(false);
  const [conditionField, setConditionField] = useState<ItemField>();
  const [currentObjective, setCurrentObjective] = useState<
    Partial<ObjectiveCreate>
  >({});

  const [objectiveType, setObjectiveType] = useState<ObjectiveType | null>(
    null
  );

  const event = events?.find((event) => event.id === eventId);
  const [operatorForField, setOperatorForField] = useState<{
    [key in ItemField]: Operator[];
  }>();
  const [numberFieldsForObjectiveType, setNumberFieldsForObjectiveType] =
    useState<{
      [key in ObjectiveType]: NumberField[];
    }>();

  useEffect(() => {
    conditionApi.getValidMappings(eventId).then((data) => {
      setOperatorForField(
        Object.entries(data.field_to_type).reduce(
          (acc, [key, value]) => {
            acc[key as ItemField] = data.valid_operators[value];
            return acc;
          },
          {} as { [key in ItemField]: Operator[] }
        )
      );
      setNumberFieldsForObjectiveType(
        data.objective_type_to_number_fields as {
          [key in ObjectiveType]: NumberField[];
        }
      );
    });
  }, [eventId]);

  useEffect(() => {
    if (!event) {
      return;
    }
    scoringApi.getScoringPresetsForEvent(event.id).then(setScoringPresets);
  }, [event, setScoringPresets]);

  useEffect(() => {
    if (!categoryId) {
      return;
    }
  }, [categoryId]);

  // const categoryColumns: CrudColumn<Category>[] = useMemo(
  //   () => [
  //     {
  //       title: "ID",
  //       dataIndex: "id",
  //       key: "id",
  //       type: "number",
  //     },
  //     {
  //       title: "Name",
  //       dataIndex: "name",
  //       key: "name",
  //       type: "text",
  //       required: true,
  //       editable: true,
  //       render: (name: string, data: Category) => {
  //         return (
  //           <Link
  //             className="btn btn-primary m-1"
  //             to={`/admin/events/$eventId/categories/$categoryId`}
  //             params={{ eventId: eventId!, categoryId: data.id }}
  //           >
  //             {name}
  //           </Link>
  //         );
  //       },
  //     },
  //     {
  //       title: "Sub Categories",
  //       dataIndex: "children",
  //       key: "children",
  //       render: (data: Category[]) => {
  //         return (
  //           <div>
  //             {data.map((category) => {
  //               return (
  //                 <Link
  //                   className="btn btn-dash m-1"
  //                   key={category.id}
  //                   to={`/admin/events/$eventId/categories/$categoryId`}
  //                   params={{ eventId: eventId!, categoryId: category.id }}
  //                 >
  //                   {category.name}
  //                 </Link>
  //               );
  //             })}
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       title: "Scoring Method",
  //       dataIndex: "scoring_preset_id",
  //       key: "scoring_preset_id",
  //       type: "select",
  //       options: scoringPresets
  //         .filter((preset) => preset.type == ScoringPresetType.CATEGORY)
  //         .map((preset) => {
  //           return { label: preset.name, value: preset.id };
  //         }),
  //       editable: true,
  //       render: (id) => {
  //         return scoringPresets.find((preset) => preset.id === id)?.name;
  //       },
  //     },
  //   ],
  //   [scoringPresets]
  // );

  const objectiveForm = useMemo(() => {
    const nameInput = (
      <>
        <label className="label">Name</label>
        <input
          name="name"
          type="text"
          className="input"
          required
          defaultValue={currentObjective.name}
        />
      </>
    );
    const extraInput = (
      <>
        <label className="label">Extra</label>
        <input
          name="extra"
          className="input"
          type="text"
          defaultValue={currentObjective.extra}
        />
      </>
    );
    const requiredNumberInput = (
      <>
        <label className="label">Required Number</label>
        <input
          name="required_number"
          type="number"
          className="input"
          required
          defaultValue={currentObjective.required_number || 1}
        />
      </>
    );
    const objectiveTypeInput = (
      <>
        <label className="label">Objective Type</label>
        <Select
          name="objective_type"
          required
          value={currentObjective.objective_type}
          onChange={(value) => {
            setObjectiveType(value as ObjectiveType);
          }}
          options={Object.values(ObjectiveType)}
        ></Select>
      </>
    );
    const numberfieldInput = objectiveType ? (
      <>
        <label className="label">Number Field</label>
        <Select
          name="number_field"
          required
          value={currentObjective.number_field}
          options={
            numberFieldsForObjectiveType
              ? numberFieldsForObjectiveType[objectiveType]
              : []
          }
        ></Select>
      </>
    ) : null;
    const aggregationInput = objectiveType ? (
      <>
        <label className="label">Aggregation Method</label>
        <Select
          name="aggregation"
          required
          value={currentObjective.aggregation}
          key={"aggregation-" + objectiveType}
          options={availableAggregationTypes(objectiveType)}
        ></Select>
      </>
    ) : null;

    const scoringMethodInput = (
      <>
        <label className="label">Scoring Method</label>
        <Select
          name="scoring_preset_id"
          value={String(currentObjective.scoring_preset_id)}
          options={scoringPresets
            .filter((preset) => preset.type == ScoringPresetType.OBJECTIVE)
            .map((preset) => ({
              label: preset.name,
              value: String(preset.id),
            }))}
        ></Select>
      </>
    );
    const validFromInput = (
      <DateTimePicker
        label="Valid From"
        name="valid_from"
        defaultValue={currentObjective.valid_from}
      />
    );
    const validToInput = (
      <DateTimePicker
        label="Valid To"
        name="valid_to"
        defaultValue={currentObjective.valid_to}
      />
    );
    const itemNameInput =
      objectiveType === ObjectiveType.ITEM ? (
        <>
          <label className="label">Item Name</label>
          <input
            name="conditions-name"
            type="text"
            className="input"
            defaultValue={
              currentObjective.conditions?.find(
                (condition) =>
                  condition.field === ItemField.NAME &&
                  condition.operator === Operator.EQ
              )?.value
            }
          />
        </>
      ) : null;

    const itemBaseTypeInput =
      objectiveType === ObjectiveType.ITEM ? (
        <>
          <label className="label">Base Type</label>
          <input
            name="conditions-basetype"
            type="text"
            className="input"
            defaultValue={
              currentObjective.conditions?.find(
                (condition) =>
                  condition.field === ItemField.BASE_TYPE &&
                  condition.operator === Operator.EQ
              )?.value
            }
          />
        </>
      ) : null;

    function objectiveFormSubmit(e: React.FormEvent<HTMLFormElement>) {
      const form = e.currentTarget;
      e.preventDefault();
      const data = new FormData(form);
      let baseTypeConditionExists = false;
      let nameConditionExists = false;
      const conditions =
        currentObjective.conditions?.map((condition) => {
          if (
            condition.field === ItemField.BASE_TYPE &&
            condition.operator === Operator.EQ &&
            data.get("conditions-basetype")
          ) {
            baseTypeConditionExists = true;
            condition.value = data.get("conditions-basetype") as string;
          }
          if (
            condition.field === ItemField.NAME &&
            condition.operator === Operator.EQ &&
            data.get("conditions-name")
          ) {
            nameConditionExists = true;
            condition.value = data.get("conditions-name") as string;
          }
          return condition;
        }) || [];

      if (data.get("conditions-basetype") && !baseTypeConditionExists) {
        conditions.push({
          field: ItemField.BASE_TYPE,
          operator: Operator.EQ,
          value: data.get("conditions-basetype") as string,
        });
      }
      if (data.get("conditions-name") && !nameConditionExists) {
        conditions.push({
          field: ItemField.NAME,
          operator: Operator.EQ,
          value: data.get("conditions-name") as string,
        });
      }

      const objectiveCreate: ObjectiveCreate = {
        aggregation: data.get("aggregation") as AggregationType,
        parent_id: categoryId,
        conditions: conditions,
        extra: data.get("extra") as string,
        name: data.get("name") as string,
        number_field: data.get("number_field") as NumberField,
        objective_type: data.get("objective_type") as ObjectiveType,
        required_number: Number(data.get("required_number")),
      };
      if (data.get("scoring_preset_id")) {
        objectiveCreate.scoring_preset_id = Number(
          data.get("scoring_preset_id")
        );
      }
      if (data.get("valid_from")) {
        objectiveCreate.valid_from = data.get("valid_from") as string;
      }
      if (data.get("valid_to")) {
        objectiveCreate.valid_to = data.get("valid_to") as string;
      }
      if (currentObjective.id) {
        objectiveCreate.id = currentObjective.id;
      }
      objectiveApi.createObjective(eventId, objectiveCreate).then(() => {
        setRefreshObjectives((prev) => !prev);
        setIsObjectiveModalOpen(false);
      });
    }

    return (
      <form key={currentObjective.id} onSubmit={objectiveFormSubmit}>
        <div className="flex flxe-col">
          <fieldset className="fieldset mb-4 p-4 w-full rounded-l-box bg-base-300">
            {nameInput}
            {objectiveTypeInput}
            {itemNameInput}
            {aggregationInput}
            {numberfieldInput}
            {scoringMethodInput}
          </fieldset>
          <fieldset className="fieldset mb-4 p-4 w-full rounded-r-box bg-base-300">
            {extraInput}
            {requiredNumberInput}
            {itemBaseTypeInput}
            {validFromInput}
            {validToInput}
          </fieldset>
        </div>
        <div className="flex gap-2 justify-end ">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setIsObjectiveModalOpen(false);
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    );
  }, [
    currentObjective,
    objectiveType,
    scoringPresets,
    categoryId,
    eventId,
    numberFieldsForObjectiveType,
  ]);

  const objectiveColumns: CrudColumn<Objective>[] = useMemo(
    () => [
      {
        title: "",
        key: "id",
        render: (_: string, data: Objective) => (
          <ObjectiveIcon
            objective={data}
            gameVersion={event?.game_version ?? GameVersion.poe1}
          />
        ),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        type: "text",
        editable: true,
      },
      {
        title: "Extra",
        dataIndex: "extra",
        key: "extra",
        type: "text",
        editable: true,
      },
      {
        title: "Required Number",
        dataIndex: "required_number",
        key: "required_number",
        type: "number",
        editable: true,
      },
      {
        title: "Objective Type",
        dataIndex: "objective_type",
        key: "objective_type",
        type: "select",
        options: Object.values(ObjectiveType),
        editable: true,
      },
      {
        title: "Aggregation Method",
        dataIndex: "aggregation",
        key: "aggregation",
        type: "select",
        options: Object.values(AggregationType),
        editable: true,
      },
      {
        title: "Attribute",
        dataIndex: "number_field",
        key: "number_field",
        type: "select",
        options: Object.values(NumberField),
        editable: true,
      },
      {
        title: "Scoring Method",
        dataIndex: "scoring_preset_id",
        key: "scoring_preset_id",
        type: "select",
        render: (data: number | null) => {
          return scoringPresets.find((preset) => preset.id === data)?.name;
        },
      },
      {
        title: "Conditions",
        dataIndex: "conditions",
        key: "conditions",
        type: "text",
        editable: true,
        render: (data: Condition[]) => {
          return (
            <div>
              {data.map((condition) => {
                const text =
                  condition.field +
                  " " +
                  operatorToString(condition.operator) +
                  " " +
                  condition.value;
                return (
                  <div
                    key={`badge-${condition.id}`}
                    className="tooltip"
                    data-tip={text}
                  >
                    <div className="badge badge-primary badge-sm">
                      <XCircleIcon
                        className="h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          conditionApi
                            .deleteCondition(eventId, condition.id)
                            .then(() => {
                              event.stopPropagation();
                              setRefreshObjectives((prev) => !prev);
                            });
                        }}
                      />

                      {text.slice(0, 10)}
                      {text.length > 10 ? "..." : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    ],
    [scoringPresets, event, eventId]
  );

  const addtionalObjectiveActions = [
    {
      name: "Edit",
      func: async (data: Objective) => {
        setObjectiveType(data.objective_type);
        setCurrentObjective({ ...data });
        setIsObjectiveModalOpen(true);
      },
      icon: <PencilSquareIcon className="h-6 w-6" />,
    },
    {
      name: "Add Condition",
      func: async (data: Objective) => {
        setCurrentObjective({ ...data });
        setIsConditionModalOpen(true);
      },
      icon: <PlusIcon className="h-6 w-6" />,
    },
    {
      name: "Duplicate",
      func: async (data: Objective) => {
        const newObjective: ObjectiveCreate = {
          ...data,
          id: undefined,
          conditions: data.conditions.map((condition) => {
            return { ...condition, id: undefined, objective_id: undefined };
          }),
        };
        objectiveApi.createObjective(eventId, newObjective).then(() => {
          setRefreshObjectives((prev) => !prev);
        });
      },
      icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
    },
  ];

  const objectiveTable = useMemo(() => {
    return (
      <>
        <h3>{"Objectives"} </h3>
        <CrudTable<Objective>
          resourceName="Objective"
          columns={objectiveColumns}
          fetchFunction={() =>
            objectiveApi.getObjectiveTreeForEvent(eventId).then((data) => {
              const obj = getSubObjective(data, categoryId);
              return obj?.children || [];
            })
          }
          deleteFunction={(obj) =>
            objectiveApi.deleteObjective(eventId, obj.id)
          }
          addtionalActions={addtionalObjectiveActions}
        />
        <button
          className="btn btn-primary m-2"
          onClick={() => {
            setCurrentObjective({});
            setIsObjectiveModalOpen(true);
          }}
        >
          Create new Objective
        </button>
        <button
          className="btn btn-primary m-2"
          onClick={() => {
            setIsBulkObjectiveModalOpen(true);
          }}
        >
          Create Bulk Objectives
        </button>
      </>
    );
  }, [objectiveColumns, categoryId, addtionalObjectiveActions, eventId]);

  const bulkObjeciveModal = useMemo(
    () => (
      <Dialog
        title="Create Objectives in bulk"
        open={isBulkObjectiveModalOpen}
        setOpen={setIsBulkObjectiveModalOpen}
      >
        <div className="flex justify-end flex-col gap-y-4">
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              createBulkItemObjectives(
                eventId,
                categoryId,
                data.get("name_list") as string,
                Number(data.get("scoring_method")),
                data.get("aggregation_method") as AggregationType,
                data.get("identifier") as ItemField
              ).then(() => {
                setIsBulkObjectiveModalOpen(false);
                setRefreshObjectives((prev) => !prev);
              });
            }}
          >
            <fieldset className="fieldset bg-base-300 p-4 rounded-box mb-4">
              <label className="label">Comma separated list of names</label>
              <input
                name="name_list"
                type="text"
                className="input w-full"
                required
              />
              <label className="label">Identifier</label>
              <Select
                className="w-full"
                name="identifier"
                required
                options={["NAME", "BASE_TYPE"]}
              ></Select>
              <label className="label">Scoring Method</label>
              <Select
                className="w-full"
                name="scoring_method"
                required
                options={scoringPresets
                  .filter(
                    (preset) => preset.type == ScoringPresetType.OBJECTIVE
                  )
                  .map((preset) => ({
                    label: preset.name,
                    value: String(preset.id),
                  }))}
              ></Select>
              <label className="label">Aggregation Method</label>
              <Select
                name="aggregation_method"
                required
                className="w-full"
                options={Object.values(AggregationType)}
              ></Select>
            </fieldset>
            <div className="flex gap-2 justify-end ">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setIsBulkObjectiveModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    ),
    [isBulkObjectiveModalOpen, categoryId, eventId, scoringPresets]
  );
  const objectiveModal = (
    <Dialog
      title="Create Objective"
      open={isObjectiveModalOpen}
      setOpen={setIsObjectiveModalOpen}
    >
      <div className="flex justify-end flex-col gap-y-4">{objectiveForm}</div>
    </Dialog>
  );

  const conditionModal = useMemo(() => {
    return (
      <Dialog
        title="Create Condition"
        open={isConditionModalOpen}
        setOpen={setIsConditionModalOpen}
      >
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            if (!currentObjective.id) {
              return;
            }
            const conditionCreate = {
              field: conditionField!,
              operator: data.get("operator") as Operator,
              value: data.get("value") as string,
              objective_id: currentObjective.id,
            };
            conditionApi.createCondition(eventId, conditionCreate).then(() => {
              setIsConditionModalOpen(false);
              setRefreshObjectives((prev) => !prev);
            });
          }}
        >
          <fieldset className="fieldset bg-base-300 p-4 rounded-box mb-4">
            <label className="label">Field</label>
            <Select
              className="w-full"
              name="condition-field"
              options={Object.values(ItemField)}
              onChange={(value) => {
                setConditionField(value as ItemField);
              }}
            ></Select>
            {conditionField !== undefined ? (
              <>
                <label className="label">Operator</label>
                <Select
                  name="operator"
                  className="w-full"
                  required
                  options={
                    operatorForField ? operatorForField[conditionField] : []
                  }
                ></Select>
              </>
            ) : null}
            <label className="label">Value</label>
            <input name="value" type="text" className="input w-full" required />
          </fieldset>
          <div className="flex gap-2 justify-end ">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setIsConditionModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [
    currentObjective,
    isConditionModalOpen,
    conditionField,
    eventId,
    operatorForField,
  ]);

  if (!categoryId) {
    return <></>;
  }

  return (
    <>
      {objectiveModal}
      {bulkObjeciveModal}
      {conditionModal}
      {/* <h1>{"Category " + categoryName} </h1>
      {categoryTable} */}
      {objectiveTable}
    </>
  );
}

export default ScoringCategoryPage;
