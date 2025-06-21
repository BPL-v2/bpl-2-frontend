import React, { JSX, useMemo, useState } from "react";
import { sendWarning } from "@utils/notifications";
import ArrayInput from "./arrayinput";
import dayjs from "dayjs";
import { DateTimePicker } from "./datetime-picker";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Dialog } from "./dialog";
import Select, { SelectOption } from "./select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  options?: string[] | SelectOption[];
  render?: (value: any, record: T, index: number) => React.ReactNode;
  inputRenderer?: (record: any, dataSetter: (data: any) => void) => JSX.Element;
}

export type action = {
  name: string;
  func?: (data: any) => Promise<any>;
  visible?: (data: any) => boolean;
  reload?: boolean;
  render?: (data: any) => React.ReactNode;
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
  const queryClient = useQueryClient();

  // Use TanStack Query for data fetching
  const { data: data = [], isLoading, error } = useQuery({
    queryKey: [resourceName, "list"],
    queryFn: fetchFunction,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFunction!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
      setIsCreateModalOpen(false);
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: editFunction!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
      setIsCreateModalOpen(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFunction!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
      setIsDeleteModalOpen(false);
    },
  });

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
            createMutation.mutate(createData);
          } else if (currentData && editFunction) {
            // @ts-ignore ugly hack so that we can use put endpoints for updates and no new object is created
            createData.id = currentData.id;
            editMutation.mutate(createData);
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
                  <Select
                    name={String(key)}
                    value={defaultVal}
                    key={"input-" + defaultVal}
                    className="w-full"
                    options={column.options!}
                    required={column.required}
                  ></Select>
                );
              } else if (column.type === "text[]") {
                input = (
                  <ArrayInput
                    value={currentData[key] as string[]}
                    label={String(column.title)}
                    key={"input-" + String(currentData[key])}
                  />
                );
              } else if (column.type === "multiselect") {
                input = (
                  <select
                    multiple
                    className="select h-40 w-full"
                    key={"input-" + String(currentData[key])}
                    name={String(key)}
                  >
                    {column.options?.map((option) => {
                      const label =
                        typeof option === "string" ? option : option.label;
                      const value =
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
                    key={"input-" + String(currentData[key])}
                  />
                );
              } else {
                return;
              }
              return (
                <div key={"input" + idx}>
                  <label
                    className="fieldset-label"
                    key={"label" + idx + "-" + String(column.title)}
                  >
                    {String(column.title)}
                  </label>
                  {input}
                </div>
              );
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
            disabled={createMutation.isPending || editMutation.isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={createMutation.isPending || editMutation.isPending}
          >
            {createMutation.isPending || editMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : null}
            {currentData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    );
  }, [
    currentData,
    columns,
    data,
    formValidator,
    createFunction,
    editFunction,
  ]);

  // Show loading state while data is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-lg">Loading {resourceName}...</p>
        </div>
      </div>
    );
  }

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
                deleteMutation.mutate(currentData);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : null}
              Yes
            </button>
          </div>
        </Dialog>
      ) : (
        ""
      )}

      {error && (
        <div className="alert alert-error">
          <span>Error loading data: {(error as Error).message}</span>
        </div>
      )}

      {!isLoading && !error && (
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
                        const value = entry[
                          column.dataIndex as keyof T
                        ] as React.ReactNode;
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
                      <div className="flex flex-wrap gap-2">
                        {editFunction && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setCurrentData({ ...entry });
                              setIsCreateModalOpen(true);
                            }}
                            disabled={createMutation.isPending || editMutation.isPending}
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
                            disabled={deleteMutation.isPending}
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
                                  if (!action.func) {
                                    return;
                                  }
                                  setCurrentData(entry);
                                  action.func(entry).then(() => {
                                    if (action.reload) {
                                      queryClient.invalidateQueries({ queryKey: [resourceName, "list"] });
                                    }
                                  });
                                }}
                              >
                                {action.render
                                  ? action.render(data)
                                  : action.name}
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
                    disabled={createMutation.isPending || editMutation.isPending}
                  >
                    Create new {resourceName}
                  </button>
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      )}
    </>
  );
};

export default CrudTable;
