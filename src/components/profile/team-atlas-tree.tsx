import { useFile, useGetTeamAtlas, useGetUsers } from "@client/query";
import { ComposedTree } from "./composed-tree";
import { CompactTree } from "@mytypes/tree";
import { CategoryIcon } from "@icons/category-icons";
import { JSX, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";
import Table from "@components/table/table";
import { GlobalStateContext } from "@utils/context-provider";
import { Link } from "@tanstack/react-router";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

function getRealAtlasPoints(nodes: number[]): number {
  if (nodes.includes(65225)) {
    return nodes.length - 20;
  }
  return nodes.length;
}

export function TeamAtlasTree() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { teamAtlas = [] } = useGetTeamAtlas(currentEvent.id);
  const { users = [] } = useGetUsers(currentEvent.id);
  const [selectedAtlas, setSelectedAtlas] = useState<number[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<number, (typeof users)[0]>,
  );

  const [selectedLeagueMechanics, setSelectedLeagueMechanics] = useState<
    string[]
  >([]);
  const { data: json } = useFile<CompactTree>(
    `/assets/trees/json/atlas/${currentEvent.patch}.json`,
  );
  const leagueNodes = Object.entries(json?.nodes || {})
    .filter(([_, node]) => node.isMastery)
    .reduce(
      (acc, [id, node]) => {
        if (!node.name || !json?.groups) {
          return acc;
        }
        acc[node.name] = acc[node.name] || [];
        const nodes =
          Object.values(json.groups)
            .find((group) => group.nodes.includes(id))
            ?.nodes.map((nodeId) => Number(nodeId)) || [];
        const notables = nodes.filter(
          (nodeId) =>
            json.nodes[String(nodeId)].isNotable ||
            json.nodes[String(nodeId)].isKeystone,
        );
        acc[node.name] = acc[node.name].concat(notables);
        return acc;
      },
      {} as Record<string, number[]>,
    );
  const mavenNodes = Object.entries(json?.nodes || {})
    .filter(
      ([_, node]) =>
        (node.isNotable || node.isKeystone) &&
        node.stats?.some((stat) => stat.includes("Maven")),
    )
    .map(([id, _]) => Number(id));

  if (mavenNodes.length > 0) {
    leagueNodes["Maven"] = mavenNodes;
  }

  const aliases: Record<string, string> = {
    "The Searing Exarch": "Exarch",
    "The Shaper and Elder": "U.Elder",
    "Settlers of Kalguur": "Kingsmarch",
    "The Eater of Worlds": "Eater",
    "Atlas Memories": "Memories",
    "Vaal Side Areas": "Vaal",
  };
  const iconAliases: Record<string, string> = {
    "The Searing Exarch": "Searing Exarch",
    "The Shaper and Elder": "Uber Elder",
    "Settlers of Kalguur": "Kingsmarch",
    "The Eater of Worlds": "Eater of Worlds",
    "Atlas Memories": "Memories",
    Conquerors: "Sirus",
    Shrines: "Shrine",
    "Vaal Side Areas": "Atziri",
    Strongboxes: "Strongbox",
    Scarabs: "Scarab",
  };
  const renderAtlasColumn =
    (
      idx: number,
      selectedLeagueMechanics: string[],
      setSelectedNodes: React.Dispatch<React.SetStateAction<Set<number>>>,
    ) =>
    ({ row }: any): JSX.Element => {
      const treeNodes = row.original.trees[idx];
      return (
        <div
          onClick={() => {
            setSelectedNodes(new Set());
            if (
              idx === selectedAtlas[0] &&
              row.original.user_id === selectedAtlas[1]
            ) {
              setSelectedAtlas([]);
              return;
            }
            setSelectedAtlas([idx, row.original.user_id]);
          }}
          className={twMerge(
            "flex h-full w-full cursor-pointer flex-wrap",
            idx === row.original.primary_index && "rounded-lg bg-white/10",
            idx === selectedAtlas[0] &&
              row.original.user_id === selectedAtlas[1] &&
              "rounded-lg outline-2 outline-white",
          )}
        >
          {Object.entries(leagueNodes).map(([name, nodes]) => {
            if (!nodes.some((nodeId: number) => treeNodes?.includes(nodeId))) {
              return;
            }
            return (
              <div
                key={name}
                className={twMerge(
                  "flex items-center rounded-lg p-1",
                  selectedLeagueMechanics?.includes(name) &&
                    "bg-base-200 outline outline-highlight-content",
                )}
              >
                <CategoryIcon
                  name={iconAliases[name] || name}
                  key={name}
                  className="size-6"
                />
              </div>
            );
          })}
        </div>
      );
    };

  const primaryAtlases = teamAtlas
    .map((ta) => ta.trees[ta.primary_index])
    .filter((tree) => {
      if (!selectedLeagueMechanics) {
        return true;
      }
      for (const mechanic of selectedLeagueMechanics) {
        const leagueNodeIds = leagueNodes[mechanic];
        if (!leagueNodeIds) {
          continue;
        }
        let mechanicIsPresent = false;
        for (const nodeId of leagueNodeIds) {
          if (tree.includes(nodeId)) {
            mechanicIsPresent = true;
            break;
          }
        }
        if (!mechanicIsPresent) {
          return false;
        }
      }
      return true;
    })
    .map((nodes) => new Set(nodes));
  return (
    <div className="card bg-base-200 p-8">
      <div className="flex flex-row justify-center gap-8">
        <div className="mb-8 grid auto-rows-min grid-cols-5 items-start gap-2">
          {Object.keys(leagueNodes)
            .sort((a, b) => a.localeCompare(b))
            .map((name) => {
              let countOfAtlasWithMechanic = 0;
              for (const atlas of primaryAtlases) {
                for (const nodeId of leagueNodes[name]) {
                  if (atlas.has(nodeId)) {
                    countOfAtlasWithMechanic += 1;
                    break;
                  }
                }
              }
              return (
                <div
                  className="tooltip xl:[&:after]:hidden xl:[&:before]:hidden"
                  data-tip={`${aliases[name] || name} (${countOfAtlasWithMechanic} Atlases)`}
                  key={name}
                >
                  <div
                    key={name}
                    className={twMerge(
                      "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-box bg-base-300 p-2 xl:justify-between",
                      selectedLeagueMechanics.includes(name) &&
                        "tooltip bg-highlight outline-2 outline-highlight-content",
                      countOfAtlasWithMechanic === 0 && "opacity-20",
                    )}
                    onClick={() => {
                      if (selectedLeagueMechanics.includes(name)) {
                        setSelectedLeagueMechanics((prev) =>
                          prev.filter((n) => n !== name),
                        );
                      } else {
                        setSelectedLeagueMechanics((prev) => [...prev, name]);
                      }
                    }}
                  >
                    <span
                      className={twMerge(
                        "hidden text-xs xl:block",
                        selectedLeagueMechanics.includes(name) &&
                          "text-highlight-content",
                      )}
                    >
                      {aliases[name] || name}
                    </span>
                    <CategoryIcon
                      name={iconAliases[name] || name}
                      key={name}
                      className={twMerge("size-6 xl:size-12")}
                    />
                    <span
                      className={twMerge(
                        "hidden text-xs xl:block",
                        selectedLeagueMechanics.includes(name) &&
                          "text-highlight-content",
                      )}
                    >
                      {countOfAtlasWithMechanic} Atlases
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="w-[65%]">
          <ComposedTree
            nodes={
              selectedAtlas.length == 0
                ? primaryAtlases
                : [
                    new Set(
                      teamAtlas.find((ta) => ta.user_id === selectedAtlas[1])
                        ?.trees[selectedAtlas[0]] || [],
                    ),
                  ]
            }
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            version={currentEvent.patch!}
            type="atlas"
          />
        </div>
      </div>
      <p className="-mt-6 mb-2">
        <span
          className="tooltip cursor-help"
          data-tip="Latest atlas tree that some of its nodes changed"
        >
          Estimated<span className="text-error">*</span>
        </span>{" "}
        current atlas tree is highlighted
      </p>
      <Table
        className="max-h-[70vh]"
        columns={[
          {
            header: "",
            accessorKey: "player",
            size: 200,
            filterFn: "includesString",
            enableSorting: false,
            meta: {
              filterVariant: "string",
              filterPlaceholder: "Player",
            },
            cell: ({ row }: any) => (
              <Link
                to={`/profile/$userId`}
                params={{ userId: row.original.user_id }}
                className="flex link items-center gap-1 link-hover"
              >
                <ArrowTopRightOnSquareIcon className="inline size-4" />
                {row.original.player}
              </Link>
            ),
          },
          { header: "Points", accessorKey: "points", size: 100 },
          {
            header: "Atlas 1",
            cell: renderAtlasColumn(
              0,
              selectedLeagueMechanics,
              setSelectedNodes,
            ),
            size: 320,
          },
          {
            header: "Atlas 2",
            cell: renderAtlasColumn(
              1,
              selectedLeagueMechanics,
              setSelectedNodes,
            ),
            size: 320,
          },
          {
            header: "Atlas 3",
            cell: renderAtlasColumn(
              2,
              selectedLeagueMechanics,
              setSelectedNodes,
            ),
            size: 320,
          },
        ]}
        data={teamAtlas
          .map((ta) => ({
            user_id: ta.user_id,
            player: userMap[ta.user_id]?.display_name || `User ${ta.user_id}`,
            points: Object.values(ta.trees).reduce(
              (acc, tree) => Math.max(acc, getRealAtlasPoints(tree)),
              0,
            ),
            trees: ta.trees,
            primary_index: ta.primary_index,
          }))
          .filter((row) => {
            if (
              selectedLeagueMechanics.length === 0 &&
              selectedNodes.size === 0
            ) {
              return true;
            }
            const treeNodes = row.trees[row.primary_index];
            for (const mechanic of selectedLeagueMechanics) {
              const leagueNodeIds = leagueNodes[mechanic];
              if (!leagueNodeIds) {
                continue;
              }
              let mechanicIsPresent = false;
              for (const nodeId of leagueNodeIds) {
                if (treeNodes.includes(nodeId)) {
                  mechanicIsPresent = true;
                  break;
                }
              }
              if (!mechanicIsPresent) {
                return false;
              }
            }
            if (selectedNodes.size > 0) {
              for (const nodeId of selectedNodes) {
                if (!treeNodes.includes(nodeId)) {
                  return false;
                }
              }
            }

            return true;
          })
          .sort((a, b) => a.user_id - b.user_id)}
      />
    </div>
  );
}
