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
import Select, { SelectOption } from "./select";
import { twMerge } from "tailwind-merge";

function Table<T>({
  data,
  columns,
  rowClassName,
  rowStyle,
  className,
  sortable = true,
  styles,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  rowClassName?: (row: Row<T>) => string;
  rowStyle?: (row: Row<T>) => React.CSSProperties;
  className?: string;
  sortable?: boolean;
  styles?: {
    header?: string;
    body?: string;
    table?: string;
  };
}) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const options: TableOptions<T> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  };
  if (sortable) {
    options.getSortedRowModel = getSortedRowModel();
    options.onSortingChange = setSorting;
  }
  const state: Partial<TableState> = {
    sorting,
  };
  options.state = state;

  const table = useReactTable(options);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    if (table.getRowModel().rows.length) {
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
      <table className={twMerge("table table-md", styles?.table)}>
        <thead
          className={twMerge(
            "sticky top-0 z-2 font-bold text-lg bg-base-200",
            styles?.header
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full ">
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
                        sortable && header.column.getCanSort()
                          ? "select-none flex items-center gap-2 cursor-pointer"
                          : ""
                      }
                    >
                      {sortable && header.column.getCanSort() ? (
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
          className={styles?.body}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<T>;
            return (
              <tr
                className={twMerge(
                  "flex absolute w-full items-center bg-base-300",
                  rowClassName ? rowClassName(row) : " hover:bg-base-200"
                )}
                style={{
                  ...(rowStyle ? rowStyle(row) : {}),
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                data-index={virtualRow.index}
                ref={(node) => rowVirtualizer.measureElement(node)}
                key={row.id}
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

type ColumnDefMeta<T> = {
  filterVariant?: "string" | "enum" | "boolean";
  filterPlaceholder?: string;
  options?: T[] | SelectOption<T>[];
};

function Filter<T>({ column }: { column: Column<T, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, filterPlaceholder, options } =
    (column.columnDef.meta as ColumnDefMeta<T>) ?? {};

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
        value={(columnFilterValue ?? "") as T}
        options={options!}
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
