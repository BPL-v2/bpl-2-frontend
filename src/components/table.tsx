import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  TableOptions,
  TableState,
  useReactTable,
} from "@tanstack/react-table";
import { TableSortIcon } from "../icons/table-sort";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pageSizeOptions?: number[];
}

export function Table<T>({ data, columns, pageSizeOptions }: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeOptions ? pageSizeOptions[0] : 10,
  });
  const options: TableOptions<T> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  };
  const state: Partial<TableState> = {
    sorting,
  };
  options.state = state;
  if (pageSizeOptions) {
    state["pagination"] = pagination;
    options.getPaginationRowModel = getPaginationRowModel();
    options.onPaginationChange = setPagination;
  }
  const table = useReactTable<T>(options);

  return (
    <>
      <table className="table table-compact">
        <thead className="bg-base-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none "
                        : undefined
                    }
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: `${header.getSize()}px` }}
                  >
                    <div className="flex items-center gap-1">
                      {header.column.getCanSort() ? (
                        <TableSortIcon
                          className="h-5 w-5"
                          sort={sorting.find((sort) => sort.id === header.id)}
                        ></TableSortIcon>
                      ) : null}
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-base-300 ">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-base-200/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageSizeOptions ? (
        <div className="bg-base-200 flex justify-end">
          <div className="join border-1 rounded-field">
            <button
              className="join-item btn bg-base-100"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="join-item btn bg-base-100"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button className="join-item btn  bg-base-100">
              {table.getState().pagination.pageIndex + 1}
            </button>

            <button
              className="join-item btn  bg-base-100"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="join-item btn bg-base-100"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
