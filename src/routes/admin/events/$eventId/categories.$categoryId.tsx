import { createFileRoute, Link } from "@tanstack/react-router";
import React, { JSX, useMemo, useState } from "react";

import {
  AggregationType,
  ConditionCreate,
  GameVersion,
  ItemField,
  NumberField,
  Objective,
  ObjectiveConditionCreate,
  ObjectiveCreate,
  ObjectiveType,
  Operator,
  Permission,
} from "@client/api";
import { Dialog } from "@components/dialog";
import { ObjectiveIcon } from "@components/objective-icon";
import { useParams } from "@tanstack/react-router";

import {
  useAddObjectiveCondition,
  useCreateBulkObjectives,
  useCreateObjective,
  useDeleteObjective,
  useDeleteObjectiveCondition,
  useGetEvents,
  useGetRules,
  useGetScoringPresetsForEvent,
  useGetValidConditionMappings,
} from "@client/query";
import { setFormValues, useAppForm } from "@components/form/context";
import Table from "@components/table";
import {
  DocumentDuplicateIcon,
  FolderOpenIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { findObjective, getPath } from "@utils/utils";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute(
  "/admin/events/$eventId/categories/$categoryId",
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

type ExtendedObjectiveCreate = ObjectiveCreate & {
  item_base_type?: string;
  item_name?: string;
};

export type BulkObjectiveCreate = {
  nameList: string;
  scoring_preset_id: number;
  aggregation_method: AggregationType;
  item_field: ItemField;
};

export function ScoringCategoryPage(): JSX.Element {
  const qc = useQueryClient();
  const { eventId, categoryId } = useParams({ from: Route.id });
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkObjectiveModalOpen, setIsBulkObjectiveModalOpen] =
    useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const { events } = useGetEvents();
  const { scoringPresets } = useGetScoringPresetsForEvent(eventId);
  const { rules } = useGetRules(eventId);
  const { operatorForField, numberFieldsForObjectiveType } =
    useGetValidConditionMappings(eventId);

  const { deleteObjective } = useDeleteObjective(qc, eventId);
  const { createObjective } = useCreateObjective(qc, eventId, () => {
    setIsObjectiveModalOpen(false);
    setIsCategoryModalOpen(false);
    objectiveForm.reset();
  });
  const { createBulkObjectives } = useCreateBulkObjectives(
    qc,
    eventId,
    categoryId,
    () => {
      setIsBulkObjectiveModalOpen(false);
      bulkObjectiveForm.reset();
    },
  );
  const { addObjectiveCondition } = useAddObjectiveCondition(qc, eventId, () =>
    setIsConditionModalOpen(false),
  );
  const { deleteObjectiveCondition } = useDeleteObjectiveCondition(qc, eventId);
  const objective = findObjective(
    rules,
    (objective) => objective.id === categoryId,
  );
  const event = events?.find((event) => event.id === eventId);
  const path = getPath(rules, categoryId);
  const bulkObjectiveForm = useAppForm({
    defaultValues: {} as BulkObjectiveCreate,
    onSubmit: (data) => createBulkObjectives(data.value),
  });
  const categoryForm = useAppForm({
    defaultValues: {
      aggregation: null,
      scoring_preset_id: null,
      name: "",
      extra: "",
      number_field: NumberField.FINISHED_OBJECTIVES,
      required_number: 1,
      conditions: [],
      parent_id: categoryId,
      objective_type: ObjectiveType.CATEGORY,
    } as unknown as ObjectiveCreate,
    onSubmit: (data) => createObjective(data.value),
  });
  const objectiveForm = useAppForm({
    defaultValues: {
      required_number: 1,
      conditions: [],
      parent_id: categoryId,
      hide_progress: false,
    } as unknown as ExtendedObjectiveCreate,
    onSubmit: (data) => {
      if (data.value.item_name) {
        data.value.conditions = extendConditions(
          data.value.conditions,
          data.value.item_name,
          ItemField.NAME,
        );
        delete data.value.item_name;
      }
      if (data.value.item_base_type) {
        data.value.conditions = extendConditions(
          data.value.conditions,
          data.value.item_base_type,
          ItemField.BASE_TYPE,
        );
        delete data.value.item_base_type;
      }
      createObjective(data.value);
    },
  });
  const conditionForm = useAppForm({
    defaultValues: {} as ConditionCreate,
    onSubmit: (data) => addObjectiveCondition(data.value),
  });

  const { objective_type } = useStore(
    objectiveForm.store,
    (state) => state.values,
  );

  const { field: itemField } = useStore(
    conditionForm.store,
    (state) => state.values,
  );

  const objectivColumns: ColumnDef<Objective>[] = useMemo(
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
        size: 200,
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
        size: 200,
      },
      {
        header: "Scoring Method",
        cell: ({ row }) => {
          const scoringPreset = scoringPresets.find(
            (preset) => preset.id === row.original.scoring_preset_id,
          );
          return <div>{scoringPreset?.name}</div>;
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
                  <div className="tooltip" key={"condition-" + condition.id}>
                    <span className="tooltip-content flex flex-row items-center gap-1">
                      <span className="text-success">{condition.field}</span>
                      <span className="text-info">{condition.operator}</span>
                      <span className="text-error">{condition.value}</span>
                    </span>
                    <div className="badge badge-sm pr-[1px] whitespace-nowrap badge-primary select-none">
                      {condition.field}
                      <XCircleIcon
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => deleteObjectiveCondition(condition.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex flex-row gap-2">
              <div
                className="tooltip tooltip-bottom tooltip-warning"
                data-tip="Edit"
              >
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => {
                    setFormValues(objectiveForm, row.original);
                    objectiveForm.setFieldValue(
                      "item_base_type",
                      row.original.conditions.find(
                        (condition) =>
                          condition.field === ItemField.BASE_TYPE &&
                          condition.operator === Operator.EQ,
                      )?.value,
                    );
                    objectiveForm.setFieldValue(
                      "item_name",
                      row.original.conditions.find(
                        (condition) =>
                          condition.field === ItemField.NAME &&
                          condition.operator === Operator.EQ,
                      )?.value,
                    );
                    setIsObjectiveModalOpen(true);
                  }}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-error"
                data-tip="Delete"
              >
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => deleteObjective(row.original.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-info"
                data-tip="Duplicate"
              >
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    const duplicate = JSON.parse(
                      JSON.stringify(row.original),
                    ) as ObjectiveCreate;
                    duplicate.id = undefined;
                    duplicate.conditions = row.original.conditions.map(
                      (condition) => {
                        return {
                          ...condition,
                          id: undefined,
                        };
                      },
                    );
                    createObjective(duplicate);
                  }}
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-success"
                data-tip="Add Condition"
              >
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    conditionForm.setFieldValue(
                      "objective_id",
                      row.original.id,
                    );
                    setIsConditionModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-secondary"
                data-tip="Open as Category"
              >
                <Link
                  to={"/admin/events/$eventId/categories/$categoryId"}
                  params={{ eventId: eventId!, categoryId: row.original.id }}
                  className="btn btn-sm btn-secondary"
                >
                  <FolderOpenIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        },
      },
    ],
    [scoringPresets, event, objectiveForm],
  );

  const objectiveDialog: React.ReactNode = useMemo(() => {
    return (
      <Dialog
        title={"Create Objective"}
        open={isObjectiveModalOpen}
        setOpen={setIsObjectiveModalOpen}
        className="h-[80vh] max-h-[90vh] max-w-2xl"
      >
        <form
          className="flex w-full flex-col gap-2 rounded-box bg-base-300 p-4"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            objectiveForm.handleSubmit();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <objectiveForm.AppField
              name="name"
              children={(field) => <field.TextField label="Name" required />}
            />
            <objectiveForm.AppField
              name="extra"
              children={(field) => <field.TextField label="Extra" />}
            />
            <objectiveForm.AppField
              name="objective_type"
              children={(field) => (
                <field.SelectField
                  label="Objective Type"
                  options={Object.values(ObjectiveType).filter(
                    (t) => t != ObjectiveType.CATEGORY,
                  )}
                  required
                />
              )}
            />
            <objectiveForm.AppField
              name="aggregation"
              children={(field) => (
                <field.SelectField
                  label="Aggregation"
                  options={Object.values(AggregationType)}
                  required
                />
              )}
            />
            <objectiveForm.AppField
              name="number_field"
              children={(field) => (
                <field.SelectField
                  label="Number Field"
                  options={
                    numberFieldsForObjectiveType && objective_type
                      ? numberFieldsForObjectiveType[objective_type]
                      : []
                  }
                  required
                  hidden={!objective_type}
                />
              )}
            />
            <objectiveForm.AppField
              name="required_number"
              children={(field) => (
                <field.NumberField
                  label="Required Number"
                  required
                  hidden={!objective_type}
                />
              )}
            />
            <objectiveForm.AppField
              name="item_base_type"
              children={(field) => (
                <field.TextField
                  label="Base Type"
                  hidden={objective_type !== ObjectiveType.ITEM}
                />
              )}
            />
            <objectiveForm.AppField
              name="item_name"
              children={(field) => (
                <field.TextField
                  label="Item Name"
                  hidden={objective_type !== ObjectiveType.ITEM}
                />
              )}
            />
            <objectiveForm.AppField
              name="valid_from"
              children={(field) => <field.DateTimeField label="Valid From" />}
            />
            <objectiveForm.AppField
              name="valid_to"
              children={(field) => <field.DateTimeField label="Valid To" />}
            />
            <objectiveForm.AppField
              name="scoring_preset_id"
              children={(field) => (
                <field.SelectField
                  label="Scoring Preset"
                  options={scoringPresets.map((preset) => ({
                    label: preset.name,
                    value: preset.id,
                  }))}
                />
              )}
            />
            <objectiveForm.AppField
              name="hide_progress"
              children={(field) => (
                <field.BooleanField
                  label="Hide Progress"
                  className="checkbox-xl checkbox-primary"
                />
              )}
            />
          </div>
          <div className="flex flex-row justify-end gap-2">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => {
                setIsObjectiveModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [
    scoringPresets,
    objective_type,
    numberFieldsForObjectiveType,
    isObjectiveModalOpen,
    objectiveForm,
  ]);

  const bulkObjectiveDialog: React.ReactNode = useMemo(() => {
    return (
      <Dialog
        title="Create Objectives in bulk"
        open={isBulkObjectiveModalOpen}
        setOpen={setIsBulkObjectiveModalOpen}
        className="max-w-lg"
      >
        <form
          className="flex w-full flex-col gap-2 rounded-box bg-base-300 p-4"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            bulkObjectiveForm.handleSubmit();
          }}
        >
          <bulkObjectiveForm.AppField
            name="nameList"
            children={(field) => (
              <field.TextField
                label="Name List (Comma separated)"
                required
                placeholder="Item1, Item2, Item3"
              />
            )}
          />
          <bulkObjectiveForm.AppField
            name="scoring_preset_id"
            children={(field) => (
              <field.SelectField
                label="Scoring Preset"
                className="w-full"
                required
                options={scoringPresets.map((preset) => ({
                  label: preset.name,
                  value: preset.id,
                }))}
              />
            )}
          />
          <bulkObjectiveForm.AppField
            name="aggregation_method"
            children={(field) => (
              <field.SelectField
                label="Aggregation Method"
                className="w-full"
                required
                options={Object.values(AggregationType)}
              />
            )}
          />
          <bulkObjectiveForm.AppField
            name="item_field"
            children={(field) => (
              <field.SelectField
                label="Item Field"
                className="w-full"
                required
                options={[ItemField.NAME, ItemField.BASE_TYPE]}
              />
            )}
          />
          <div className="flex flex-row justify-end gap-2">
            <button
              type="button"
              className="btn btn-error"
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
      </Dialog>
    );
  }, [scoringPresets, isBulkObjectiveModalOpen, bulkObjectiveForm]);

  const categoryDialog: React.ReactNode = useMemo(() => {
    return (
      <Dialog
        title={"Create Category"}
        open={isCategoryModalOpen}
        setOpen={setIsCategoryModalOpen}
        className="max-w-lg"
      >
        <form
          className="flex w-full flex-col gap-2 rounded-box bg-base-300 p-4"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            categoryForm.handleSubmit();
          }}
        >
          <categoryForm.AppField
            name="name"
            children={(field) => <field.TextField label="Name" required />}
          />
          <categoryForm.AppField
            name="extra"
            children={(field) => <field.TextField label="Extra" />}
          />
          <categoryForm.AppField
            name="aggregation"
            children={(field) => (
              <field.SelectField
                label="Aggregation"
                options={Object.values(AggregationType)}
                required
              />
            )}
          />
          <categoryForm.AppField
            name="scoring_preset_id"
            children={(field) => (
              <field.SelectField
                label="Scoring Preset"
                options={scoringPresets.map((preset) => ({
                  label: preset.name,
                  value: preset.id,
                }))}
              />
            )}
          />
          <div className="flex flex-row justify-end gap-2">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => {
                setIsCategoryModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [scoringPresets, isCategoryModalOpen, categoryForm]);

  const conditionDialog: React.ReactNode = useMemo(() => {
    let operatorOptions: Operator[] = [];
    if (operatorForField && itemField) {
      operatorOptions = operatorForField[itemField];
    }
    return (
      <Dialog
        title="Create Condition"
        open={isConditionModalOpen}
        setOpen={setIsConditionModalOpen}
        className="max-w-lg"
      >
        <form
          className="flex w-full flex-col gap-2 rounded-box bg-base-300 p-4"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            conditionForm.handleSubmit();
          }}
        >
          <conditionForm.AppField
            name="field"
            children={(field) => (
              <field.SelectField
                label="Field"
                options={Object.values(ItemField)}
                required
              />
            )}
          />
          <conditionForm.AppField
            name="operator"
            children={(field) => (
              <field.SelectField
                label="Operator"
                options={operatorOptions}
                required
                hidden={!itemField}
              />
            )}
          />
          <conditionForm.AppField
            name="value"
            children={(field) => <field.TextField label="Value" required />}
          />
          <div className="flex flex-row justify-end gap-2">
            <button
              type="button"
              className="btn btn-error"
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
  }, [operatorForField, itemField, isConditionModalOpen, conditionForm]);

  const table = useMemo(() => {
    return (
      <Table<Objective>
        className="h-[70vh] w-full"
        columns={objectivColumns}
        data={objective?.children.sort((a, b) => a.id - b.id) || []}
        sortable={false}
      />
    );
  }, [objective?.children, objectivColumns]);

  if (!categoryId) {
    return <></>;
  }
  return (
    <div className="mt-4 flex flex-col gap-4">
      {objectiveDialog}
      {bulkObjectiveDialog}
      {categoryDialog}
      {conditionDialog}
      <div className="flex w-full flex-col rounded-box bg-base-300 p-4">
        <h1 className="mb-4 text-2xl font-bold">
          Categories and Subcategories
        </h1>
        {path.map((activeId) => {
          const activObjective = findObjective(
            rules,
            (objective) => objective.id === activeId,
          );
          const children = activObjective?.children.filter(
            (child) => child.children.length > 0 || child.id === categoryId,
          );
          return (
            <div key={"category-" + activeId}>
              {path[0] !== activeId && (
                <div className="divider my-2 divider-primary select-none"></div>
              )}
              <div className="flex flex-row flex-wrap gap-1">
                {children?.map((objective) => (
                  <div key={"category-child-" + objective.id}>
                    <Link
                      to={"/admin/events/$eventId/categories/$categoryId"}
                      params={{ eventId: eventId!, categoryId: objective.id }}
                      className={twMerge(
                        "btn",
                        path.includes(objective.id)
                          ? "btn-primary"
                          : "btn-dash",
                      )}
                    >
                      {objective.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-row justify-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsCategoryModalOpen(true);
            categoryForm.reset();
          }}
        >
          Create Subcategory
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormValues(categoryForm, objective);
            setIsCategoryModalOpen(true);
          }}
        >
          Edit this Category
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsObjectiveModalOpen(true);
          }}
        >
          Create new Objective
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setIsBulkObjectiveModalOpen(true)}
        >
          Create Objectives in bulk
        </button>
      </div>
      {table}
    </div>
  );
}

export default ScoringCategoryPage;

function extendConditions(
  conditions: ObjectiveConditionCreate[],
  value: string,
  field: ItemField,
) {
  let exists = false;
  const newConditions = conditions.map((condition) => {
    if (condition.field === field && condition.operator === Operator.EQ) {
      condition.value = value;
      exists = true;
    }
    return condition;
  });
  if (!exists) {
    newConditions.push({
      field: field,
      operator: Operator.EQ,
      value: value,
    });
  }
  return newConditions;
}
