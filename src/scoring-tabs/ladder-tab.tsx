import { useContext, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  getRootCategoryNames,
  getSubCategory,
} from "../types/scoring-category";
import { getTotalPoints } from "../utils/utils";
import { LadderEntry, Team } from "../client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { getLevelProgress } from "../types/level-info";
import { ascendancies, phreciaMapping } from "../types/ascendancy";
import { TableSortIcon } from "../icons/table-sort";
type RowDef = {
  default: number;
  team: Team;
  key: string;
  Collections: number;
  Uniques: number;
  Bounties: number;
  Races: number;
  Dailies: number;
};

export function LadderTab() {
  const [sorting, setSorting] = useState<SortingState>([]); // can set initial sorting state here
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const { scores, currentEvent, isMobile, users, ladder, gameVersion } =
    useContext(GlobalStateContext);
  const columnHelper = createColumnHelper<LadderEntry>();

  const columns = [
    columnHelper.accessor("rank", {
      cell: (info) => info.getValue(),
      header: () => "Rank",
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("character_name", {
      header: () => "Character",
    }),
    columnHelper.accessor("account_name", {
      header: () => "Account",
    }),
    columnHelper.accessor((row) => userToTeam[row.user_id] || "Cartographers", {
      header: "Team",
    }),
    columnHelper.accessor("character_class", {
      header: () => "Ascendancy",
      cell: (info) => {
        const classObj =
          ascendancies[gameVersion][
            phreciaMapping[
              info.row.original.character_class as keyof typeof phreciaMapping
            ]
          ];
        if (!classObj) {
          return info.row.original.character_class;
        }
        return (
          <div className="flex items-center gap-2">
            <img
              src={classObj.thumbnail}
              alt={classObj.image}
              className="h-8 w-8 rounded-full"
            />
            <p className={`font-bold ${classObj.classColor}`}>
              {info.row.original.character_class}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("experience", {
      header: "Level",
      cell: (info) => {
        const progress = getLevelProgress(
          info.row.original.experience,
          info.row.original.level
        );
        return (
          <div className="flex items-center gap-2">
            {info.row.original.level}
            <div className="w-[60px] ">
              <progress
                className="progress progress-primary"
                value={progress}
                max="100"
              ></progress>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("delve", {
      header: "Delve",
      cell: (info) => {
        return info.row.original.delve;
      },
    }),
  ];
  const table = useReactTable<LadderEntry>({
    data: ladder,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
  });
  if (!scores || !currentEvent || !currentEvent.teams) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );
  const userToTeam = users.reduce((acc, user) => {
    acc[user.id] = teamMap[user.team_id]?.name;
    return acc;
  }, {} as { [userId: number]: string });
  const categoryNames = getRootCategoryNames(currentEvent.game_version);
  const categories = categoryNames.map((categoryName) =>
    getSubCategory(scores, categoryName)
  );
  categories.push(scores);

  const points = categories.reduce((acc, category) => {
    if (!category) {
      return acc;
    }
    const points = getTotalPoints(category);
    for (const [teamId, teamPoints] of Object.entries(points)) {
      const id = parseInt(teamId);
      if (!acc[id]) {
        acc[id] = {};
      }
      acc[id][category.name] = teamPoints;
    }
    return acc;
  }, {} as { [teamId: number]: { [categoryName: string]: number } });
  const rows = Object.entries(points).map(([teamId, teamPoints]) => {
    return {
      team: teamMap[parseInt(teamId)],
      key: teamId,
      ...teamPoints,
    } as RowDef;
  });
  const scoreColumns: any[] = [
    {
      title: "Team",
      dataIndex: ["team", "name"],
      render: (row: any) => row.team?.name,
      key: "team",
    },
    {
      title: "Total",
      dataIndex: "default",
      key: "default",
      defaultSortOrder: "descend",
    },
    ...getCompletionColumns(isMobile),
  ];

  function getCompletionColumns(isMobile: boolean) {
    if (isMobile) {
      return [
        {
          title: "Categories",
          render: (record: RowDef) => {
            return (
              <>
                <div className="flex flex-wrap gap-2">
                  {categoryNames.map((categoryName) => {
                    return (
                      <div
                        key={`badge-${categoryName}`}
                        className="badge badge-primary badge-lg"
                      >
                        {/* @ts-ignore */}
                        {`${categoryName} ${record[categoryName]}`}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          },
        },
      ];
    }

    return categoryNames.map((categoryName) => ({
      title: categoryName,
      dataIndex: categoryName,
      key: `column-${categoryName}`,
      sorter: (a: any, b: any) => a[categoryName] - b[categoryName],
    }));
  }

  return (
    <>
      <div className="divider divider-primary ">{"Team Scores"}</div>
      <table className="table bg-base-300 text-lg">
        <thead className="bg-base-200">
          <tr>
            {scoreColumns.map((column) => (
              <th key={`header-${column.key}`}>
                {
                  // @ts-ignore
                  column.title
                }
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-base-200/50">
              {scoreColumns.map((column) => (
                <td key={`column-${column.key}`}>
                  {
                    // @ts-ignore
                    column.render ? column.render(row) : row[column.dataIndex]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider divider-primary">{"Ladder"}</div>

      <table className="table bg-base-300 table-compact ">
        <thead className="bg-base-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : undefined
                    }
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      <TableSortIcon
                        className="h-5 w-5"
                        sort={sorting.find((sort) => sort.id === header.id)}
                      ></TableSortIcon>

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
        <tbody className="bg-base-300">
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
      <div className="bg-base-200 flex justify-end">
        <div className="join border-1 ">
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
            {table.getState().pagination.pageIndex + 1}{" "}
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
    </>
  );
}
