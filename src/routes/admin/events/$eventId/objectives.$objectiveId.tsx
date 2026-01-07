import { createFileRoute, Link } from "@tanstack/react-router";
import React, { JSX, useMemo, useState } from "react";

import {
  AggregationType,
  Condition,
  GameVersion,
  ItemField,
  NumberField,
  Objective,
  ObjectiveCreate,
  ObjectiveType,
  ObjectiveValidation,
  Operator,
  Permission,
} from "@client/api";
import { Dialog } from "@components/dialog";
import { ObjectiveIcon } from "@components/objective-icon";
import { useParams } from "@tanstack/react-router";

import {
  useCreateBulkObjectives,
  useCreateObjective,
  useDeleteObjective,
  useGetEvents,
  useGetObjectiveValidations,
  useGetRules,
  useGetScoringPresetsForEvent,
  useGetValidConditionMappings,
} from "@client/query";
import { setFormValues, useAppForm } from "@components/form/context";
import Table from "@components/table/table";
import {
  ClipboardDocumentListIcon,
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
import { objectiveApi } from "@client/client";

export const Route = createFileRoute(
  "/admin/events/$eventId/objectives/$objectiveId",
)({
  component: renderConditionally(ScoringCategoryPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),
  params: {
    parse: (params) => ({
      eventId: Number(params.eventId),
      objectiveId: Number(params.objectiveId),
    }),
    stringify: (params) => ({
      eventId: params.eventId.toString(),
      objectiveId: params.objectiveId.toString(),
    }),
  },
});

type ExtendedObjectiveCreate = ObjectiveCreate & {
  item_base_type?: string;
  item_name?: string;
};

export type BulkObjectiveCreate = {
  nameList: string;
  scoring_preset_ids: number[];
  aggregation_method: AggregationType;
  item_field: ItemField;
};

export function ScoringCategoryPage(): JSX.Element {
  const qc = useQueryClient();
  const { eventId, objectiveId } = useParams({ from: Route.id });
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkObjectiveModalOpen, setIsBulkObjectiveModalOpen] =
    useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [editedObjective, setEditedObjective] = useState<Objective | null>(
    null,
  );
  const { events } = useGetEvents();
  const { scoringPresets } = useGetScoringPresetsForEvent(eventId);
  const { rules } = useGetRules(eventId);
  const { operatorForField, numberFieldsForObjectiveType } =
    useGetValidConditionMappings(eventId);
  const { objectiveValidations } = useGetObjectiveValidations(eventId);
  const validationMap = objectiveValidations.reduce(
    (map, validation) => {
      map[validation.objective_id] = validation;
      return map;
    },
    {} as Record<number, ObjectiveValidation>,
  );

  const { deleteObjective } = useDeleteObjective(qc, eventId);
  const { createObjective } = useCreateObjective(qc, eventId, () => {
    setIsObjectiveModalOpen(false);
    setIsCategoryModalOpen(false);
    setEditedObjective(null);
    setIsConditionModalOpen(false);
    objectiveForm.reset();
  });
  const { createBulkObjectives } = useCreateBulkObjectives(
    qc,
    eventId,
    objectiveId,
    () => {
      setIsBulkObjectiveModalOpen(false);
      bulkObjectiveForm.reset();
    },
  );
  const objective = findObjective(
    rules,
    (objective) => objective.id === objectiveId,
  );
  const event = events?.find((event) => event.id === eventId);
  const path = getPath(rules, objectiveId);
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
      number_field_explanation: null,
      required_number: 1,
      conditions: [],
      parent_id: objectiveId,
      objective_type: ObjectiveType.CATEGORY,
      scoring_preset_ids: [],
    } as unknown as ObjectiveCreate,
    onSubmit: (data) => createObjective(data.value),
  });
  const objectiveForm = useAppForm({
    defaultValues: {
      required_number: 1,
      conditions: [],
      parent_id: objectiveId,
      hide_progress: false,
      scoring_preset_ids: [],
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
    defaultValues: {} as Condition,
    onSubmit: (data) => {
      if (!editedObjective) return;
      const editedObjectiveConditions = [
        ...editedObjective.conditions.filter(
          (condition) =>
            !(
              condition.field === data.value.field &&
              condition.operator === data.value.operator
            ),
        ),
        data.value,
      ];
      const objectiveCreate: ObjectiveCreate = {
        ...editedObjective,
        scoring_preset_ids: editedObjective.scoring_presets.map(
          (preset) => preset.id,
        ),
        conditions: editedObjectiveConditions,
      };
      createObjective(objectiveCreate);
    },
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
        header: "Valid.",
        cell: ({ row }) => {
          const validation = validationMap[row.original.id];
          return validation ? (
            <ClipboardDocumentListIcon
              className="size-6 cursor-pointer text-success transition-transform duration-100 select-none hover:text-primary active:scale-110 active:text-secondary"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(validation.item, null, 2),
                )
              }
            />
          ) : (
            <span className="text-error">✗</span>
          );
        },
        size: 60,
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
        size: 150,
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
                      <XCircleIcon
                        className="size-4 cursor-pointer"
                        onClick={() =>
                          createObjective({
                            ...row.original,
                            scoring_preset_ids:
                              row.original.scoring_presets.map(
                                (preset) => preset.id,
                              ),
                            conditions: row.original.conditions.filter(
                              (c) => c !== condition,
                            ),
                          })
                        }
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
                  className="btn btn-xs btn-warning"
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
                    objectiveForm.setFieldValue(
                      "scoring_preset_ids",
                      row.original.scoring_presets.map((preset) => preset.id),
                    );
                    setIsObjectiveModalOpen(true);
                  }}
                >
                  <PencilSquareIcon className="size-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-error"
                data-tip="Delete"
              >
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => deleteObjective(row.original.id)}
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-info"
                data-tip="Duplicate"
              >
                <button
                  className="btn btn-xs btn-info"
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
                  <DocumentDuplicateIcon className="size-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-success"
                data-tip="Add Condition"
              >
                <button
                  className="btn btn-xs btn-success"
                  onClick={() => {
                    setEditedObjective(row.original);
                    setIsConditionModalOpen(true);
                  }}
                >
                  <PlusIcon className="size-4" />
                </button>
              </div>
              <div
                className="tooltip tooltip-bottom tooltip-secondary"
                data-tip="Open as Category"
              >
                <Link
                  to={"/admin/events/$eventId/objectives/$objectiveId"}
                  params={{ eventId: eventId!, objectiveId: row.original.id }}
                  className="btn btn-xs btn-secondary"
                >
                  <FolderOpenIcon className="size-4" />
                </Link>
              </div>
            </div>
          );
        },
      },
    ],
    [scoringPresets, event, objectiveForm, validationMap],
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
              name="number_field_explanation"
              children={(field) => (
                <field.TextField
                  label="Submission Value Explanation"
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
              name="scoring_preset_ids"
              children={(field) => (
                <field.MultiSelectField
                  label="Scoring Presets"
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
            name="scoring_preset_ids"
            children={(field) => (
              <field.MultiSelectField
                label="Scoring Presets"
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
            name="scoring_preset_ids"
            children={(field) => (
              <field.MultiSelectField
                label="Scoring Presets"
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

  if (!objectiveId) {
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
            (child) => child.children.length > 0 || child.id === objectiveId,
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
                      to={"/admin/events/$eventId/objectives/$objectiveId"}
                      params={{ eventId: eventId!, objectiveId: objective.id }}
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
            categoryForm.setFieldValue(
              "scoring_preset_ids",
              objective?.scoring_presets.map((preset) => preset.id) || [],
            );
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
        <button
          className="btn btn-success"
          onClick={() =>
            objectiveApi
              .validateObjectives(eventId, { timeout_seconds: 300 })
              .then(() => qc.invalidateQueries())
          }
        >
          Validate Objectives
        </button>
      </div>
      {table}
    </div>
  );
}

export default ScoringCategoryPage;

function extendConditions(
  conditions: Condition[],
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
