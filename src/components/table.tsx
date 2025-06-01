import React from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  SortingState,
  TableOptions,
  TableState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TableSortIcon } from "@icons/table-sort";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import Select from "./select";

function Table<T>({
  data,
  columns,
  rowClassName,
  className,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  rowClassName?: (row: Row<T>) => string;
  className?: string;
}) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const options: TableOptions<T> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
  };
  const state: Partial<TableState> = {
    sorting,
  };
  options.state = state;

  const table = useReactTable(options);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 80,
    getScrollElement: () => tableRef.current,
    overscan: 5,
  });
  return (
    <div ref={tableRef} className={"overflow-auto " + className}>
      <table className="table table-md">
        <thead className="bg-base-300 sticky top-0 z-2 font-bold text-lg">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full bg-base-200">
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}
                    className="flex items-center"
                  >
                    <div
                      className={
                        header.column.getCanSort()
                          ? "select-none flex items-center gap-2 cursor-pointer"
                          : ""
                      }
                    >
                      {header.column.getCanSort() ? (
                        <div onClick={header.column.getToggleSortingHandler()}>
                          <TableSortIcon
                            className="h-5 w-5 "
                            sort={sorting.find((sort) => sort.id === header.id)}
                          ></TableSortIcon>
                        </div>
                      ) : null}
                      <div
                        className="flex items-center flex-row"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="select-none"
                          >
                            <Filter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody
          className="bg-base-300"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<T>;
            return (
              <tr
                className={
                  "flex absolute w-full items-center " +
                  (rowClassName ? rowClassName(row) : " hover:bg-base-200/50")
                }
                data-index={virtualRow.index}
                ref={(node) => rowVirtualizer.measureElement(node)}
                key={row.id}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      style={{
                        display: "flex",
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  // @ts-ignore
  const { filterVariant, filterPlaceholder, options } =
    column.columnDef.meta ?? {};

  if (filterVariant === "string") {
    return (
      <input
        className="input text-lg"
        onChange={(e) => {
          column.setFilterValue(e.target.value);
          e.stopPropagation();
        }}
        placeholder={filterPlaceholder}
        type="string"
        value={(columnFilterValue ?? "") as string}
      />
    );
  }
  if (filterVariant === "enum") {
    return (
      <Select
        onChange={column.setFilterValue}
        value={(columnFilterValue ?? "") as string}
        options={options}
        fontSize="text-lg"
        placeholder={filterPlaceholder}
      ></Select>
    );
  }

  if (filterVariant === "boolean") {
    return (
      <div
        className="w-8 h-8 bg-base-300 ml-2 border-1 border-primary rounded-full cursor-pointer select-none"
        onClick={(e) => {
          const currentValue = column.getFilterValue();
          if (currentValue === undefined) {
            column.setFilterValue(false);
          }
          if (currentValue === false) {
            column.setFilterValue(true);
          }
          if (currentValue === true) {
            column.setFilterValue(undefined);
          }
          e.stopPropagation();
        }}
      >
        {column.getFilterValue() ===
        undefined ? undefined : column.getFilterValue() === false ? (
          <XCircleIcon className="h-full w-full text-error" />
        ) : (
          <CheckCircleIcon className="h-full w-full text-success" />
        )}
      </div>
    );
  }
}
