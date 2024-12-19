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
} from "antd";
import type { FormInstance, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { sendWarning } from "../utils/notifications";

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

type CrudTableProps<T> = {
  columns: CrudColumn<T>[];
  resourceName: string;
  fetchFunction: () => Promise<T[]>;
  editFunction?: funcOnData<T>;
  deleteFunction?: funcOnData<T>;
  createFunction?: funcOnData<T>;
  addtionalActions?: { [name: string]: funcOnData<T> };
  formValidator?: (data: Partial<T>) => string | undefined;
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
}: CrudTableProps<T>) => {
  const creationFormRef = useRef<FormInstance>(null);
  const updateFormRef = useRef<FormInstance>(null);

  const antdColumns = columns as TableProps<T>["columns"];

  const actionColumns =
    editFunction || deleteFunction
      ? [
          {
            title: "",
            key: "action",
            render: (record: T) => (
              <Space size={5}>
                {editFunction && (
                  <Button
                    onClick={() => {
                      setCurrentData(record);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {deleteFunction && (
                  <Button
                    onClick={() => {
                      setCurrentData(record);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                )}
                {addtionalActions
                  ? Object.entries(addtionalActions).map(([name, action]) => (
                      <Button
                        key={"action-" + name}
                        onClick={() => {
                          setCurrentData(record);
                          action(record);
                        }}
                      >
                        {name}
                      </Button>
                    ))
                  : ""}
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
    fetchFunction().then((data) => {
      setData(data);
    });
  }, [fetchFunction, setData]);
  useEffect(() => {
    if (updateFormRef.current) {
      updateFormRef.current.setFieldsValue(currentData);
    }
  }, [currentData]);
  useEffect(() => {
    fetchFunction().then((data) => {
      setData([...data]); // Ensure a new array reference
    });
  }, [fetchFunction, setData]);
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
          input = <DatePicker></DatePicker>;
        } else if (column.type === "select") {
          input = (
            <Select style={{ width: "100%" }}>
              <Select.Option value={""}>None</Select.Option>
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
          input = <Input />;
        } else {
          return;
        }
        return (
          <Form.Item
            key={String(key)}
            name={String(key)}
            label={String(column.title)}
            valuePropName={column.type === "checkbox" ? "checked" : "value"}
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
              const validationError = formValidator?.(
                updateFormRef.current?.getFieldsValue()
              );
              if (validationError) {
                sendWarning(validationError);
                return;
              }

              if (
                formValidator !== undefined &&
                creationFormRef.current?.getFieldsValue() !== undefined
              ) {
                console.log("validating");

                const validationError = formValidator(
                  updateFormRef.current?.getFieldsValue()
                );
                if (validationError) {
                  sendWarning(validationError);
                  return;
                }
              }
              editFunction({
                ...currentData,
                ...updateFormRef.current?.getFieldsValue(),
              }).then(() => {
                setIsUpdateModalOpen(false);
                setCurrentData({});

                setTimeout(() => {
                  fetchFunction().then((data) => {
                    setData(data);
                  });
                }, 100);
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
