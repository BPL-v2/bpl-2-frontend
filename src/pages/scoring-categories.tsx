import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";

import { useParams } from "react-router-dom";
import { ScoringCategory } from "../types/scoring-category";
import {
  createScoringCategory,
  deleteCategory as deleteScoringCategory,
  fetchCategoryById,
} from "../client/category-client";
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Select,
  Tag,
  Typography,
  DatePicker,
} from "antd";
import { router } from "../router";
import {
  createBulkItemObjectives,
  createObjective,
  deleteObjective,
} from "../client/objective-client";
import {
  AggregationType,
  availableAggregationTypes,
  Condition,
  ItemField,
  NumberField,
  ObjectiveType,
  Operator,
  operatorForField,
  operatorToString,
  playerNumberfields,
  ScoringObjective,
} from "../types/scoring-objective";
import { createCondition, deleteCondition } from "../client/condition-client";
import { ScoringPreset, ScoringPresetType } from "../types/scoring-preset";
import { fetchScoringPresetsForEvent } from "../client/scoring-preset-client";
import { GlobalStateContext } from "../utils/context-provider";
import { UserPermission } from "../types/user";
import { CopyOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ObjectiveIcon } from "../components/objective-icon";

function addCondition(
  data: Partial<ScoringObjective>,
  value: string,
  type: ItemField
) {
  let conditions = (data.conditions || []).filter(
    (condition) => condition.field !== type
  );
  if (value !== "") {
    conditions.push({
      field: type,
      operator: Operator.EQ,
      value: value,
    });
  }
  return { ...data, conditions: conditions };
}

var renderConditionInput = (
  currentData: Partial<ScoringObjective>,
  dataSetter: (data: Partial<ScoringObjective>) => void
) => {
  return (
    <>
      <div key={"input-condition-basetype"}>
        <Typography.Title level={5}>Base type =</Typography.Title>
        <Input
          onChange={(e) =>
            dataSetter(
              addCondition(currentData, e.target.value, ItemField.BASE_TYPE)
            )
          }
        />
      </div>
      <div key={"input-condition-name"}>
        <Typography.Title level={5}>Item Name =</Typography.Title>
        <Input
          onChange={(e) =>
            dataSetter(
              addCondition(currentData, e.target.value, ItemField.NAME)
            )
          }
        />
      </div>
    </>
  );
};

type FormObjective = {
  name: string | undefined;
  extra: string | undefined;
  required_number: number | undefined;
  objective_type: ObjectiveType | undefined;
  aggregation: AggregationType | undefined;
  number_field: NumberField | undefined;
  scoring_preset_id?: number | null | undefined;
  "conditions-basetype"?: string | undefined;
  "conditions-name"?: string | undefined;
  valid_from?: string | null | undefined;
  valid_to?: string | null | undefined;
};

function objectiveToFormObjective(
  objective: Partial<ScoringObjective>
): FormObjective {
  let formObjective: FormObjective = {
    name: objective.name,
    extra: objective.extra,
    required_number: objective.required_number,
    objective_type: objective.objective_type,
    aggregation: objective.aggregation,
    number_field: objective.number_field,
    "conditions-basetype": undefined,
    "conditions-name": undefined,
    scoring_preset_id: objective.scoring_preset_id,
    valid_from: objective.valid_from,
    valid_to: objective.valid_to,
  };
  if (objective.conditions) {
    objective.conditions.forEach((condition) => {
      if (
        condition.field === ItemField.BASE_TYPE &&
        condition.operator === Operator.EQ
      ) {
        formObjective["conditions-basetype"] = condition.value;
      }
      if (
        condition.field === ItemField.NAME &&
        condition.operator === Operator.EQ
      ) {
        formObjective["conditions-name"] = condition.value;
      }
    });
  }
  return formObjective;
}

function updateObjectiveWithFormObjective(
  objective: Partial<ScoringObjective>,
  formObjective: FormObjective
): Partial<ScoringObjective> {
  objective.name = formObjective.name ?? objective.name;
  objective.extra = formObjective.extra ?? objective.extra;
  objective.required_number =
    formObjective.required_number ?? objective.required_number;
  objective.objective_type =
    formObjective.objective_type ?? objective.objective_type;
  objective.aggregation = formObjective.aggregation ?? objective.aggregation;
  objective.number_field = formObjective.number_field ?? objective.number_field;
  objective.scoring_preset_id =
    formObjective.scoring_preset_id ?? objective.scoring_preset_id;
  objective.valid_from = formObjective.valid_from;
  objective.valid_to = formObjective.valid_to;
  if (formObjective["conditions-basetype"]) {
    let id = objective.conditions?.find(
      (condition) =>
        condition.field === ItemField.BASE_TYPE &&
        condition.operator === Operator.EQ
    )?.id;
    objective.conditions = objective.conditions?.filter(
      (condition) =>
        condition.field !== ItemField.BASE_TYPE ||
        condition.operator !== Operator.EQ
    );
    objective.conditions?.push({
      id: id,
      field: ItemField.BASE_TYPE,
      operator: Operator.EQ,
      value: formObjective["conditions-basetype"],
    });
  }
  if (formObjective["conditions-name"]) {
    let id = objective.conditions?.find(
      (condition) =>
        condition.field === ItemField.NAME && condition.operator === Operator.EQ
    )?.id;
    objective.conditions = objective.conditions?.filter(
      (condition) =>
        condition.field !== ItemField.NAME || condition.operator !== Operator.EQ
    );
    objective.conditions?.push({
      id: id,
      field: ItemField.NAME,
      operator: Operator.EQ,
      value: formObjective["conditions-name"],
    });
  }
  return objective;
}

const ScoringCategoryPage: React.FC = () => {
  let { user, events } = useContext(GlobalStateContext);
  let { eventId, categoryId } = useParams();
  let [categoryName, setCategoryName] = React.useState("");
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isBulkObjectiveModalOpen, setIsBulkObjectiveModalOpen] =
    useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>([]);
  const [refreshObjectives, setRefreshObjectives] = useState(false);
  const [conditionField, setConditionField] = useState<ItemField>();
  const [currentObjective, setCurrentObjective] = useState<
    Partial<ScoringObjective>
  >({});
  const objectiveFormRef = useRef<FormInstance>(null);
  const conditionFormRef = useRef<FormInstance>(null);
  const bulkObjectiveFormRef = useRef<FormInstance>(null);
  const event = events.find((event) => event.id === Number(eventId));
  useEffect(() => {
    if (objectiveFormRef.current) {
      objectiveFormRef.current.setFieldsValue(
        objectiveToFormObjective(currentObjective)
      );
    }
  }, [currentObjective]);

  useEffect(() => {
    if (!event) {
      return;
    }
    fetchScoringPresetsForEvent(event?.id).then((data) => {
      setScoringPresets(data);
    });
  }, [event, setScoringPresets]);

  useEffect(() => {
    if (!categoryId) {
      return;
    }
    fetchCategoryById(Number(categoryId)).then((data) => {
      setCategoryName(data.name);
    });
  }, [categoryId]);

  const categoryColumns: CrudColumn<ScoringCategory>[] = useMemo(
    () => [
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
        required: true,
        editable: true,
        render: (name: string, data: ScoringCategory) => {
          return (
            <button
              className="btn btn-primary m-1"
              onClick={() => {
                router.navigate(
                  `/events/${eventId}/scoring-categories/${data.id}`
                );
              }}
            >
              {name}
            </button>
          );
        },
      },
      {
        title: "Sub Categories",
        dataIndex: "sub_categories",
        key: "sub_categories",
        render: (data: ScoringCategory[]) => {
          return (
            <div>
              {data.map((category) => {
                return (
                  <button
                    className="btn btn-dash m-1"
                    key={category.id}
                    onClick={() => {
                      router.navigate(
                        `/events/${eventId}/scoring-categories/${category.id}`
                      );
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          );
        },
      },
      {
        title: "Scoring Method",
        dataIndex: "scoring_preset_id",
        key: "scoring_preset_id",
        type: "select",
        options: scoringPresets
          .filter((preset) => preset.type == ScoringPresetType.CATEGORY)
          .map((preset) => {
            return { label: preset.name, value: preset.id };
          }),
        editable: true,
        render: (id) => {
          return scoringPresets.find((preset) => preset.id === id)?.name;
        },
      },
    ],
    [scoringPresets]
  );

  const objectiveColumns: CrudColumn<ScoringObjective>[] = useMemo(
    () => [
      {
        title: "",
        key: "id",
        render: (data: ScoringObjective) => (
          <ObjectiveIcon
            objective={data}
            gameVersion={event?.game_version ?? "poe1"}
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
                return (
                  <Tag
                    key={condition.id}
                    closeIcon
                    onClose={(event) => {
                      deleteCondition(condition).then(() => {
                        event.stopPropagation();
                      });
                    }}
                  >
                    {condition.field} {operatorToString(condition.operator)}{" "}
                    {condition.value}
                  </Tag>
                );
              })}
            </div>
          );
        },
        inputRenderer: renderConditionInput,
      },
    ],
    [scoringPresets, event]
  );

  const addtionalObjectiveActions = [
    {
      name: "Edit",
      func: async (data: Partial<ScoringObjective>) => {
        setCurrentObjective({ ...data });
        setIsObjectiveModalOpen(true);
      },
      icon: <EditOutlined />,
    },
    {
      name: "Add Condition",
      func: async (data: Partial<ScoringObjective>) => {
        setCurrentObjective({ ...data });
        setIsConditionModalOpen(true);
      },
      icon: <PlusOutlined />,
    },
    {
      name: "Duplicate",
      func: async (data: Partial<ScoringObjective>) => {
        data.id = undefined;
        data.conditions = data.conditions
          ? data.conditions.map((condition) => {
              condition.id = undefined;
              return condition;
            })
          : [];
        createObjective(Number(categoryId), data).then(() => {
          setRefreshObjectives((prev) => !prev);
        });
      },
      icon: <CopyOutlined />,
    },
  ];

  let objectiveTable = useMemo(() => {
    return (
      <>
        <Typography.Title level={2}>{"Objectives"} </Typography.Title>
        <CrudTable<ScoringObjective>
          resourceName="Objective"
          columns={objectiveColumns}
          fetchFunction={() =>
            fetchCategoryById(Number(categoryId)).then(
              (data) => data.objectives
            )
          }
          deleteFunction={deleteObjective}
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
  }, [objectiveColumns, categoryId, refreshObjectives]);

  let categoryTable = useMemo(() => {
    return (
      <>
        <Typography.Title level={2}>{"Sub-Categories"}</Typography.Title>
        <CrudTable<ScoringCategory>
          resourceName="Scoring Category"
          columns={categoryColumns}
          pagination={false}
          fetchFunction={() =>
            fetchCategoryById(Number(categoryId)).then(
              (data) => data.sub_categories
            )
          }
          createFunction={(data) =>
            createScoringCategory(Number(categoryId), data)
          }
          editFunction={(data) =>
            createScoringCategory(Number(categoryId), data)
          }
          deleteFunction={deleteScoringCategory}
        />
      </>
    );
  }, [categoryColumns, categoryId]);

  let bulkObjeciveModal = useMemo(() => {
    return (
      <Modal
        title={`Bulk Objective Creation`}
        open={isBulkObjectiveModalOpen}
        onOk={() => bulkObjectiveFormRef.current?.submit()}
        onCancel={() => {
          setIsBulkObjectiveModalOpen(false);
        }}
      >
        <Form
          ref={bulkObjectiveFormRef}
          onFinish={() => {
            createBulkItemObjectives(
              Number(categoryId),
              bulkObjectiveFormRef.current?.getFieldValue("name_list"),
              bulkObjectiveFormRef.current?.getFieldValue("scoring_method"),
              bulkObjectiveFormRef.current?.getFieldValue("aggregation_method"),
              bulkObjectiveFormRef.current?.getFieldValue("identifier")
            ).then(() => {
              setIsBulkObjectiveModalOpen(false);
              setRefreshObjectives((prev) => !prev);
            });
          }}
        >
          <Form.Item name="name_list" label="Comma separated list of names">
            <Input />
          </Form.Item>
          <Form.Item name="identifier" label="Identifier">
            <Select>
              <Select.Option key="NAME" value="NAME">
                NAME
              </Select.Option>
              <Select.Option key="BASE_TYPE" value="BASE_TYPE">
                BASE_TYPE
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="scoring_method" label="Scoring Method">
            <Select>
              {scoringPresets
                .filter((preset) => preset.type == ScoringPresetType.OBJECTIVE)
                .map((preset) => {
                  return (
                    <Select.Option key={preset.id} value={preset.id}>
                      {preset.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item name="aggregation_method" label="Aggregation Method">
            <Select>
              {Object.values(AggregationType).map((type) => {
                return (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }, [isBulkObjectiveModalOpen]);
  let objectiveModal = useMemo(() => {
    return (
      <Modal
        title={`Objective`}
        open={isObjectiveModalOpen}
        onOk={() => objectiveFormRef.current?.submit()}
        onCancel={() => {
          setIsObjectiveModalOpen(false);
        }}
      >
        <Form
          ref={objectiveFormRef}
          onFinish={() => {
            let updatedObjective = updateObjectiveWithFormObjective(
              currentObjective,
              objectiveFormRef.current?.getFieldsValue()
            );
            createObjective(Number(categoryId), updatedObjective).then(() => {
              setIsObjectiveModalOpen(false);
              setRefreshObjectives((prev) => !prev);
            });
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required!" }]}
            initialValue={currentObjective.name}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="extra"
            label="Extra"
            initialValue={currentObjective.extra}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="required_number"
            label="Required Number"
            rules={[
              { required: true, message: "Required Number is required!" },
            ]}
            initialValue={currentObjective.required_number}
            style={{ width: "100%" }}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="objective_type"
            label="Objective Type"
            rules={[{ required: true, message: "Please select a type!" }]}
            initialValue={currentObjective.objective_type}
          >
            <Select
              style={{ width: "100%" }}
              onChange={(value) => {
                let obj = { ...currentObjective };
                obj.objective_type = value;
                obj.conditions = [];
                obj.aggregation = undefined;
                obj.number_field = undefined;
                if (value === ObjectiveType.ITEM) {
                  obj.number_field = NumberField.STACK_SIZE;
                } else if (value === ObjectiveType.SUBMISSION) {
                  obj.number_field = NumberField.SUBMISSION_VALUE;
                }
                setCurrentObjective(
                  updateObjectiveWithFormObjective(
                    obj,
                    objectiveFormRef.current?.getFieldsValue()
                  )
                );
              }}
            >
              {Object.values(ObjectiveType).map((type) => {
                return (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {currentObjective.objective_type ? (
            <Form.Item
              name="aggregation"
              label="Aggregation Method"
              rules={[{ required: true, message: "Please select a method!" }]}
              initialValue={currentObjective.aggregation}
              style={{ width: "100%" }}
            >
              <Select>
                {availableAggregationTypes(currentObjective.objective_type).map(
                  (type) => {
                    return (
                      <Select.Option key={type} value={type}>
                        {type}
                      </Select.Option>
                    );
                  }
                )}
              </Select>
            </Form.Item>
          ) : (
            ""
          )}
          <Form.Item
            name="scoring_preset_id"
            label="Scoring Method"
            rules={[{ required: true, message: "Please select a method!" }]}
            initialValue={
              currentObjective.scoring_preset_id ??
              currentObjective.scoring_preset?.id
            }
            style={{ width: "100%" }}
          >
            <Select>
              {scoringPresets
                .filter((preset) => preset.type == ScoringPresetType.OBJECTIVE)
                .map((preset) => {
                  return (
                    <Select.Option key={preset.id} value={preset.id}>
                      {preset.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
          {currentObjective.objective_type === ObjectiveType.ITEM ? (
            <>
              <Form.Item
                name="conditions-basetype"
                label="Item Base Type"
                initialValue={
                  currentObjective.conditions?.find(
                    (condition) =>
                      condition.field === ItemField.BASE_TYPE &&
                      condition.operator === Operator.EQ
                  )?.value
                }
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="conditions-name"
                label="Item Name"
                initialValue={
                  currentObjective.conditions?.find(
                    (condition) =>
                      condition.field === ItemField.NAME &&
                      condition.operator === Operator.EQ
                  )?.value
                }
              >
                <Input />
              </Form.Item>
            </>
          ) : (
            ""
          )}
          {currentObjective.objective_type === ObjectiveType.PLAYER ? (
            <Form.Item
              name="number_field"
              label="Attribute"
              rules={[
                { required: true, message: "Please select an attribute!" },
              ]}
              initialValue={currentObjective.number_field}
              style={{ width: "100%" }}
            >
              <Select>
                {playerNumberfields().map((field) => {
                  return (
                    <Select.Option
                      key={"playernumberfield" + field}
                      value={field}
                    >
                      {field}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          ) : (
            ""
          )}

          <Form.Item
            name="valid_from"
            label="Valid From"
            getValueProps={(value) => ({ value: value ? dayjs(value) : "" })}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="valid_to"
            label="Valid To"
            getValueProps={(value) => ({ value: value ? dayjs(value) : "" })}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }, [currentObjective, isObjectiveModalOpen]);

  let conditionModal = useMemo(() => {
    return (
      <Modal
        title={`Add Condition`}
        open={isConditionModalOpen}
        onOk={conditionFormRef.current?.submit}
        onCancel={() => setIsConditionModalOpen(false)}
      >
        <Form
          ref={conditionFormRef}
          onFinish={() => {
            if (!currentObjective.id) {
              return;
            }
            createCondition(
              currentObjective.id,
              conditionFormRef.current?.getFieldsValue()
            ).then(() => {
              setIsConditionModalOpen(false);
              setRefreshObjectives((prev) => !prev);
            });
          }}
        >
          <Form.Item
            name="field"
            label="Field"
            rules={[{ required: true, message: "Field is required!" }]}
          >
            <Select onChange={setConditionField}>
              {Object.values(ItemField).map((field) => {
                return (
                  <Select.Option key={field} value={field}>
                    {field}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {conditionField !== undefined ? (
            <Form.Item
              name="operator"
              label="Operator"
              rules={[{ required: true, message: "Operator is required!" }]}
            >
              <Select>
                {operatorForField(conditionField).map((operator) => {
                  return (
                    <Select.Option key={operator} value={operator}>
                      {operator}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          ) : (
            ""
            // conditionFormRef.current?.getFieldsValue()
          )}
          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: "Value is required!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  }, [
    currentObjective,
    isConditionModalOpen,
    conditionField,
    setConditionField,
  ]);

  if (!categoryId) {
    return <></>;
  }
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
    return <div>You do not have permission to view this page</div>;
  }

  return (
    <>
      {objectiveModal}
      {bulkObjeciveModal}
      {conditionModal}
      <Typography.Title level={1}>
        {"Category " + categoryName}{" "}
      </Typography.Title>
      {categoryTable}
      {objectiveTable}
    </>
  );
};

export default ScoringCategoryPage;
