import { JSX, useEffect, useRef, useState } from "react";
import {
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
import type { FormInstance, TablePaginationConfig, TableProps } from "antd";
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
  options?: any[] | Option[];
  inputRenderer?: (record: any, dataSetter: (data: any) => void) => JSX.Element;
}

export type action = {
  name: string;
  func: (data: any) => Promise<any>;
  visible?: (data: any) => boolean;
  reload?: boolean;
  icon?: JSX.Element;
};

type CrudTableProps<T> = {
  columns: CrudColumn<T>[];
  resourceName: string;
  fetchFunction: () => Promise<T[]>;
  editFunction?: (data: any) => Promise<T>;
  deleteFunction?: (data: any) => Promise<any>;
  createFunction?: (data: any) => Promise<T>;
  addtionalActions?: action[];
  formValidator?: (data: Partial<T>) => string | undefined;
  reload?: boolean;
  filterFunction?: (data: T) => boolean;
  pagination?: false | TablePaginationConfig;
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
  pagination,
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
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        setCurrentData(record);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <EditOutlined />
                    </button>{" "}
                  </Tooltip>
                )}
                {deleteFunction && (
                  <Tooltip title="Delete">
                    <button
                      className="btn btn-error"
                      onClick={() => {
                        setCurrentData(record);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <DeleteOutlined />
                    </button>{" "}
                  </Tooltip>
                )}
                {addtionalActions &&
                  addtionalActions.map((action) => {
                    return !action.visible || action.visible(record) ? (
                      <Tooltip
                        title={action.icon ? action.name : ""}
                        key={action.name}
                      >
                        <button
                          className="btn btn-soft"
                          onClick={() => {
                            setCurrentData(record);
                            action.func(record).then(() => {
                              if (action.reload) {
                                fetchFunction().then((data) => {
                                  setData(data);
                                });
                              }
                            });
                          }}
                        >
                          {action.icon ? action.icon : action.name}
                        </button>{" "}
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
              <button
                className="btn btn-primary"
                onClick={() => {
                  creationFormRef.current?.resetFields();
                  setCurrentData({});
                  setIsCreateModalOpen(true);
                }}
              >
                Create new {resourceName}
              </button>
            ) : (
              ""
            )}
          </>
        )}
        pagination={pagination}
      />
    </>
  );
};

export default CrudTable;
