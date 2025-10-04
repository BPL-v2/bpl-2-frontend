import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { TableSortIcon } from "@icons/table-sort";
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
import React from "react";
import { twMerge } from "tailwind-merge";
import Select, { SelectOption } from "./select";

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
    <div
      ref={tableRef}
      className={twMerge(
        "overflow-auto rounded-box border border-base-content/20 shadow-xl",
        className,
      )}
    >
      <table className={twMerge("table bg-base-300", styles?.table)}>
        <thead
          className={twMerge(
            "sticky top-0 z-1 bg-base-200 text-lg text-highlight-content",
            styles?.header,
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full">
              {headerGroup.headers.map((header) => {
                const canSort = sortable && header.column.getCanSort();
                const isSorting = !!sorting.find(
                  (sort) => sort.id === header.id,
                );
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
                        canSort
                          ? "flex cursor-pointer items-center gap-1 select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {canSort && (
                        <TableSortIcon
                          className="size-5"
                          sort={sorting.find((sort) => sort.id === header.id)}
                        ></TableSortIcon>
                      )}
                      <div
                        className={twMerge(
                          "flex flex-row items-center",
                          isSorting ? "text-primary" : "",
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanFilter() && (
                          <Filter column={header.column} />
                        )}
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
                  "absolute flex w-full items-center hover:bg-highlight",
                  rowClassName ? rowClassName(row) : "",
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
                        cell.getContext(),
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
        className="ml-2 h-8 w-8 cursor-pointer rounded-full border-1 border-primary bg-base-300 select-none"
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
