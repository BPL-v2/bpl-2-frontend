import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import type { FormInstance, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { sendWarning } from "../utils/notifications";
import ArrayInput from "./arrayinput";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

type Option = {
  label: string;
  value: any;
};

export interface CrudColumn<T> extends ColumnType<T> {
  editable?: boolean;
  required?: boolean;
  type?:
    | "text"
    | "number"
    | "checkbox"
    | "date"
    | "select"
    | "multiselect"
    | "text[]"
    | "number[]";
  defaultValue?: string;
  options?: string[] | Option[];
  inputRenderer?: (
    record: Partial<T>,
    dataSetter: (data: Partial<T>) => void
  ) => JSX.Element;
}

type funcOnData<T> = (data: Partial<T>) => Promise<any>;
export type action<T> = {
  name: string;
  func: funcOnData<T>;
  visible?: (data: Partial<T>) => boolean;
  icon?: JSX.Element;
};

type CrudTableProps<T> = {
  columns: CrudColumn<T>[];
  resourceName: string;
  fetchFunction: () => Promise<T[]>;
  editFunction?: funcOnData<T>;
  deleteFunction?: funcOnData<T>;
  createFunction?: funcOnData<T>;
  addtionalActions?: action<T>[];
  formValidator?: (data: Partial<T>) => string | undefined;
  reload?: boolean;
  filterFunction?: (data: T) => boolean;
};

const CrudTable = <T,>({
  resourceName,
  columns,
  fetchFunction,
  createFunction,
  editFunction,
  deleteFunction,
  addtionalActions,
  formValidator,
  filterFunction,
}: CrudTableProps<T>) => {
  const creationFormRef = useRef<FormInstance>(null);
  const updateFormRef = useRef<FormInstance>(null);
  const antdColumns = columns as TableProps<T>["columns"];

  const actionColumns =
    editFunction || deleteFunction || addtionalActions
      ? [
          {
            title: "",
            key: "action",
            render: (record: T) => (
              <Space size={5}>
                {editFunction && (
                  <Tooltip title="Edit">
                    <Button
                      onClick={() => {
                        setCurrentData(record);
                        setIsUpdateModalOpen(true);
                      }}
                      icon={<EditOutlined />}
                    ></Button>{" "}
                  </Tooltip>
                )}
                {deleteFunction && (
                  <Tooltip title="Delete">
                    <Button
                      onClick={() => {
                        setCurrentData(record);
                        setIsDeleteModalOpen(true);
                      }}
                      icon={<DeleteOutlined />}
                    ></Button>{" "}
                  </Tooltip>
                )}
                {addtionalActions &&
                  addtionalActions.map((action) => {
                    return !action.visible || action.visible(record) ? (
                      <Tooltip
                        title={action.icon ? action.name : ""}
                        key={action.name}
                      >
                        <Button
                          onClick={() => {
                            setCurrentData(record);
                            action.func(record);
                          }}
                          icon={action.icon ? action.icon : null}
                        >
                          {action.icon ? "" : action.name}
                        </Button>{" "}
                      </Tooltip>
                    ) : null;
                  })}
              </Space>
            ),
          },
        ]
      : [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState<Partial<T>>({});

  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    if (updateFormRef.current) {
      updateFormRef.current.setFieldsValue(currentData);
    }
  }, [currentData]);
  useEffect(() => {
    fetchFunction().then((data) => {
      setData([...data]);
    });
  }, [fetchFunction]);
  function renderForm(presets: Partial<T>) {
    return columns
      .filter((column) => column.editable)
      .map((column, idx) => {
        if (column.inputRenderer) {
          return (
            <div key={"inputRenderer" + idx}>
              {column.inputRenderer(currentData, setCurrentData)}
            </div>
          );
        }

        const key = column.dataIndex as keyof T;
        let input;
        if (column.type === "text") {
          input = <Input />;
        } else if (column.type === "number") {
          input = <InputNumber style={{ width: "100%" }} />;
        } else if (column.type === "checkbox") {
          input = <Checkbox />;
        } else if (column.type === "date") {
          input = <DatePicker showTime={{ format: "HH:mm" }}></DatePicker>;
        } else if (column.type === "select") {
          input = (
            <Select style={{ width: "100%" }}>
              {column.required ? null : (
                <Select.Option value={""}>None</Select.Option>
              )}
              {column.options?.map((option) => {
                let label = typeof option === "string" ? option : option.label;
                let value = typeof option === "string" ? option : option.value;
                return (
                  <Select.Option key={value} id={value} value={value}>
                    {label}
                  </Select.Option>
                );
              })}
            </Select>
          );
        } else if (column.type === "text[]") {
          input = <ArrayInput />;
        } else if (column.type === "multiselect") {
          input = (
            <Select mode="multiple" style={{ width: "100%" }}>
              {column.options?.map((option) => {
                let label = typeof option === "string" ? option : option.label;
                let value = typeof option === "string" ? option : option.value;
                return (
                  <Select.Option key={value} id={value} value={value}>
                    {label}
                  </Select.Option>
                );
              })}
            </Select>
          );
        } else {
          return;
        }
        return (
          <Form.Item
            key={String(key)}
            name={String(key)}
            label={String(column.title)}
            valuePropName={column.type === "checkbox" ? "checked" : "value"}
            getValueProps={(value) => {
              if (column.type === "date") {
                return { value: value ? dayjs(value) : "" };
              }
              if (column.type === "checkbox") {
                return { checked: value ? value : false };
              }
              return { value: value };
            }}
            rules={[
              {
                required: column.required ?? false,
                message: `Please input ${column.title}!`,
              },
            ]}
            initialValue={presets[key]}
          >
            {input}
          </Form.Item>
        );
      })
      .filter((element) => element !== undefined);
  }
  return (
    <>
      {createFunction ? (
        <Modal
          title={`Create new ${resourceName}`}
          open={isCreateModalOpen}
          onOk={() => {
            creationFormRef.current?.submit();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        >
          <Form
            ref={creationFormRef}
            onFinish={() => {
              const validationError = formValidator?.(
                updateFormRef.current?.getFieldsValue()
              );
              if (validationError) {
                sendWarning(validationError);
                return;
              }
              createFunction(creationFormRef.current?.getFieldsValue()).then(
                () => {
                  setIsCreateModalOpen(false);
                  setCurrentData({});
                  setTimeout(() => {
                    fetchFunction().then((data) => {
                      setData(data);
                    });
                  }, 10);
                }
              );
            }}
          >
            {renderForm(currentData)}
          </Form>
        </Modal>
      ) : (
        ""
      )}
      {editFunction ? (
        <Modal
          title={`Edit ${resourceName}`}
          open={isUpdateModalOpen}
          onOk={() => {
            updateFormRef.current?.submit();
          }}
          onCancel={() => setIsUpdateModalOpen(false)}
        >
          {" "}
          <Form
            ref={updateFormRef}
            onFinish={() => {
              editFunction({
                ...currentData,
                ...updateFormRef.current?.getFieldsValue(),
              })
                .then(() => {
                  setIsUpdateModalOpen(false);
                  setCurrentData({});

                  setTimeout(() => {
                    fetchFunction().then((data) => {
                      setData(data);
                    });
                  }, 100);
                })
                .catch((e) => {
                  sendWarning(e.message);
                });
            }}
          >
            {renderForm(currentData)}
          </Form>
        </Modal>
      ) : (
        ""
      )}
      {deleteFunction ? (
        <Modal
          title={`Delete ${resourceName}`}
          open={isDeleteModalOpen}
          onOk={() =>
            deleteFunction(currentData).then(() => {
              setIsDeleteModalOpen(false);
              fetchFunction().then((data) => {
                setData(data);
              });
            })
          }
          onCancel={() => setIsDeleteModalOpen(false)}
        >
          Do you really want to delete this {resourceName}?
        </Modal>
      ) : (
        ""
      )}
      <Table<T>
        columns={[...antdColumns!, ...actionColumns]}
        dataSource={data
          .filter((entry) => filterFunction?.(entry) ?? true)
          // @ts-ignore lets just assume that T has an id (no, setting T extends {id: number} leads to other issues)
          .sort((a, b) => a.id - b.id)
          .map((entry, idx) => {
            return { key: idx, ...entry };
          })}
        footer={() => (
          <>
            {createFunction ? (
              <Button
                onClick={() => {
                  creationFormRef.current?.resetFields();
                  setCurrentData({});
                  setIsCreateModalOpen(true);
                }}
                type="primary"
              >
                Create new {resourceName}
              </Button>
            ) : (
              ""
            )}
          </>
        )}
      />
    </>
  );
};

export default CrudTable;
