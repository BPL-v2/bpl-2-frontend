import { useEffect, useState } from "react";
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
  Typography,
} from "antd";
import type { TableProps } from "antd";
import { ColumnType } from "antd/es/table";

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
  options?: string[];
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
};

const CrudTable = <T,>({
  resourceName,
  columns,
  fetchFunction,
  createFunction,
  editFunction,
  deleteFunction,
  addtionalActions,
}: CrudTableProps<T>) => {
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

  function render(presets: Partial<T>) {
    return columns
      .filter((column) => column.editable)
      .map((column, idx) => {
        const key = column.dataIndex as keyof T;
        let input;
        if (column.type === "text") {
          input = (
            <Input
              value={presets[key] as string}
              onChange={(e) =>
                setCurrentData({
                  ...currentData,
                  [key]: e.target.value,
                })
              }
            />
          );
        } else if (column.type === "number") {
          input = (
            <InputNumber
              value={presets[key] as number}
              onChange={(e) =>
                setCurrentData({
                  ...currentData,
                  [key]: e,
                })
              }
            />
          );
        } else if (column.type === "checkbox") {
          input = (
            <Checkbox
              checked={presets[key] as boolean}
              onChange={(e) => {
                console.log(e.target.checked);
                setCurrentData({
                  ...currentData,
                  [key]: e.target.checked,
                });
              }}
            />
          );
        } else if (column.type === "date") {
          input = <DatePicker></DatePicker>;
        } else if (column.type === "select") {
          input = (
            <Select
              style={{ width: "100%" }}
              onChange={(e) => {
                setCurrentData({
                  ...currentData,
                  [key]: e,
                });
              }}
            >
              {column.options?.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          );
        } else if (column.type === "text[]") {
          input = (
            <Input
              value={presets[key] as string}
              onChange={(e) =>
                setCurrentData({
                  ...currentData,
                  [key]: e.target.value.split(","),
                })
              }
            />
          );
        } else {
          return;
        }

        return (
          <div key={"input" + idx}>
            <Typography.Title level={5}>
              {String(column.title)}
            </Typography.Title>
            {input}
          </div>
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
          onOk={() =>
            createFunction(currentData).then(() => {
              setIsCreateModalOpen(false);
              fetchFunction().then((data) => {
                setData(data);
              });
            })
          }
          onCancel={() => setIsCreateModalOpen(false)}
        >
          <Form>{render(currentData)}</Form>
        </Modal>
      ) : (
        ""
      )}
      {editFunction ? (
        <Modal
          title={`Edit ${resourceName}`}
          open={isUpdateModalOpen}
          onOk={() =>
            editFunction(currentData).then(() => {
              setIsUpdateModalOpen(false);
              fetchFunction().then((data) => {
                setData(data);
              });
            })
          }
          onCancel={() => setIsUpdateModalOpen(false)}
        >
          {" "}
          <Form>{render(currentData)}</Form>
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
        dataSource={data.map((entry, idx) => {
          // @ts-ignore: T does not need to have a key property, but react wants all rows to have it
          if (entry.key == undefined) entry.key = idx;
          return entry;
        })}
        footer={() => (
          <>
            {createFunction ? (
              <Button
                onClick={() => {
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
