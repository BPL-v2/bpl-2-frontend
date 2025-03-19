import { JSX, useEffect, useMemo, useState } from "react";
import { sendWarning } from "../utils/notifications";
import ArrayInput from "./arrayinput";
import dayjs from "dayjs";
import { DateTimePicker } from "./datetime-picker";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Dialog } from "./dialog";

type Option = {
  label: string;
  value: any;
};

export interface CrudColumn<T> {
  dataIndex?: keyof T;
  title: string;
  key: string;
  editable?: boolean;
  required?: boolean;
  hidden?: boolean;
  type?:
    | "text"
    | "number"
    | "checkbox"
    | "date"
    | "select"
    | "multiselect"
    | "text[]"
    | "number[]"
    | "color";
  defaultValue?: string;
  options?: any[] | Option[];
  render?: (value: any, record: T, index: number) => React.ReactNode;
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
};

function getFormData<T>(
  form: HTMLFormElement,
  columns: CrudColumn<T>[]
): Partial<T> {
  const formData = new FormData(form);
  const createData = {} as any;
  for (const c of columns) {
    if (!c.editable) continue;
    if (c.type === "multiselect") {
      createData[c.key] = formData.getAll(c.key);
    } else if (c.type === "checkbox") {
      createData[c.key] = formData.get(c.key) ? true : false;
    } else if (c.type === "date") {
      createData[c.key] = dayjs(formData.get(c.key) as string).toISOString();
    } else if (c.type === "number") {
      createData[c.key] = Number(formData.get(c.key));
    } else {
      createData[c.key] = formData.get(c.key);
    }
  }

  return createData as T;
}

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState<Partial<T>>({});

  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    fetchFunction().then((data) => {
      setData([...data]);
    });
  }, [fetchFunction]);

  const form = useMemo(() => {
    return (
      <form
        className="space-y-4 text-left"
        onSubmit={(e) => {
          const form = e.target as HTMLFormElement;
          e.preventDefault();
          const createData = getFormData(form, columns);
          if (formValidator) {
            const error = formValidator(data as never);
            if (error) {
              sendWarning(error);
              return;
            }
          }
          if (!currentData && createFunction) {
            createFunction(createData).then(() => {
              fetchFunction().then((data) => {
                setData(data);
              });
            });
            setIsCreateModalOpen(false);
          } else if (currentData && editFunction) {
            // @ts-ignore ugly hack so that we can use put endpoints for updates and no new object is created
            createData.id = currentData.id;
            editFunction(createData).then(() => {
              fetchFunction().then((data) => {
                setData(data);
              });
            });
            setIsCreateModalOpen(false);
          }
          form.reset();
        }}
      >
        <fieldset className="fieldset bg-base-300 p-4 rounded-box w-full">
          {columns
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
                input = (
                  <input
                    name={String(key)}
                    id={String(key)}
                    className="input w-full"
                    defaultValue={currentData[key] as string}
                    required={column.required}
                    key={String(currentData[key])}
                  />
                );
              } else if (column.type === "number") {
                input = (
                  <input
                    name={String(key)}
                    type="number"
                    className="input w-full"
                    defaultValue={currentData[key] as number}
                    required={column.required}
                    key={String(currentData[key])}
                  />
                );
              } else if (column.type === "checkbox") {
                input = (
                  <input
                    name={String(key)}
                    type="checkbox"
                    className="checkbox"
                    defaultChecked={currentData[key] as boolean}
                    key={String(currentData[key])}
                  />
                );
              } else if (column.type === "date") {
                const val = currentData[key] as string;
                input = (
                  <DateTimePicker
                    key={val}
                    name={String(key)}
                    defaultValue={val}
                    required={column.required}
                  />
                );
              } else if (column.type === "select") {
                const defaultVal = currentData[key] as string;
                input = (
                  <select
                    name={String(key)}
                    className="select w-full"
                    defaultValue={defaultVal}
                    key={defaultVal}
                  >
                    {column.required ? null : <option value={""}>None</option>}
                    {column.options?.map((option) => {
                      let label =
                        typeof option === "string" ? option : option.label;
                      let value =
                        typeof option === "string" ? option : option.value;
                      return (
                        <option key={value} id={value} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                );
              } else if (column.type === "text[]") {
                input = (
                  <ArrayInput
                    value={currentData[key] as string[]}
                    label={String(column.title)}
                    key={String(currentData[key])}
                  />
                );
              } else if (column.type === "multiselect") {
                input = (
                  <select
                    multiple
                    className="select h-40 w-full"
                    key={String(currentData[key])}
                    name={String(key)}
                  >
                    {column.options?.map((option) => {
                      let label =
                        typeof option === "string" ? option : option.label;
                      let value =
                        typeof option === "string" ? option : option.value;

                      return (
                        <option
                          key={value}
                          id={value}
                          value={value}
                          selected={(
                            (currentData[key] as string[]) ?? []
                          ).includes(value)}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                );
              } else if (column.type === "color") {
                input = (
                  <input
                    type="color"
                    name={String(key)}
                    className="input w-full"
                    defaultValue={currentData[key] as string}
                    key={String(currentData[key])}
                  />
                );
              } else {
                return;
              }
              return (
                <>
                  <label className="fieldset-label" key={String(column.title)}>
                    {String(column.title)}
                  </label>
                  {input}
                </>
              );
              // return input;
            })
            .filter((element) => element !== undefined)}
        </fieldset>
        <div className="flex gap-2 justify-end ">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIsCreateModalOpen(false);
            }}
          >
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {currentData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    );
  }, [currentData]);

  return (
    <>
      {createFunction || editFunction ? (
        <Dialog
          title={` ${currentData ? "Update " : "Create "}
              ${resourceName}`}
          open={isCreateModalOpen}
          setOpen={setIsCreateModalOpen}
        >
          <div className="flex justify-end flex-col gap-y-4">{form}</div>
        </Dialog>
      ) : null}
      {deleteFunction ? (
        <Dialog
          title={`Delete ${resourceName}`}
          open={isDeleteModalOpen}
          setOpen={setIsDeleteModalOpen}
        >
          Do you really want to delete this {resourceName}?
          <div className="flex gap-2 justify-end mt-8">
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsDeleteModalOpen(false);
              }}
            >
              No
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                deleteFunction(currentData).then(() => {
                  setIsDeleteModalOpen(false);
                  fetchFunction().then((data) => {
                    setData(data);
                  });
                });
              }}
            >
              Yes
            </button>
          </div>
        </Dialog>
      ) : (
        ""
      )}

      <table className="table bg-base-300 table-md">
        <thead className="bg-base-200 text-base-content">
          <tr>
            {columns
              .filter((column) => !column.hidden)
              .map((column) => (
                <th key={String(column.title)}>{String(column.title)}</th>
              ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((entry) => filterFunction?.(entry) ?? true)
            .sort((a, b) => (a as any).id - (b as any).id)
            .map((entry, idx) => {
              return (
                <tr key={idx}>
                  {columns
                    .filter((column) => !column.hidden)
                    .map((column, cid) => {
                      const value = entry[column.dataIndex as keyof T] as any;
                      if (column.render) {
                        return (
                          <td key={String(column.dataIndex) + cid}>
                            {
                              column.render(
                                value,
                                entry,
                                cid
                              ) as React.ReactNode
                            }
                          </td>
                        );
                      }
                      return <td key={String(column.dataIndex)}>{value}</td>;
                    })}
                  <td>
                    <div className="flex gap-2">
                      {editFunction && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setCurrentData({ ...entry });
                            setIsCreateModalOpen(true);
                          }}
                        >
                          <PencilSquareIcon className="h-6 w-6" />
                        </button>
                      )}
                      {deleteFunction && (
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => {
                            setCurrentData({ ...entry });
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <TrashIcon className="h-6 w-6" />
                        </button>
                      )}
                      {addtionalActions &&
                        addtionalActions.map((action) => {
                          return !action.visible || action.visible(entry) ? (
                            <button
                              key={action.name}
                              className="btn btn-soft btn-sm"
                              onClick={() => {
                                setCurrentData(entry);
                                action.func(entry).then(() => {
                                  if (action.reload) {
                                    fetchFunction().then((data) => {
                                      setData(data);
                                    });
                                  }
                                });
                              }}
                            >
                              {action.icon ? action.icon : action.name}
                            </button>
                          ) : null;
                        })}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
        {createFunction ? (
          <tfoot>
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center bg-base-200"
              >
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setCurrentData({});
                    setIsCreateModalOpen(true);
                  }}
                >
                  Create new {resourceName}
                </button>
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </>
  );
};

export default CrudTable;
