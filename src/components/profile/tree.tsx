import { useFile } from "@client/query";
import { CompactTree } from "@mytypes/tree";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  version: string;
  nodes: Set<number>;
  masteryMap?: Record<number, number>;
  nodeCounts?: Record<number, number>;
  type: "atlas" | "passives";
  index?: number;
  showUnallocated?: boolean;
  ascendancies?: string[];
  tooltip?: boolean;
  changeNodeStyle?: (node: number) => string;
  changeLineStyle?: (node1: number, node2: number) => string;
  selectedNodes?: Set<number>;
  setSelectedNodes?: (nodes: Set<number>) => void;
  newNodes?: Set<number>;
  removedNodes?: Set<number>;
} & React.HTMLAttributes<HTMLDivElement>;

function filterActiveConnections(
  line: string,
  nodes: Set<number>,
  ascendancies: string[],
  changeLineStyle?: (node1: number, node2: number) => string,
  newNodes?: Set<number>,
  removedNodes?: Set<number>,
): string {
  const idMatch = line.match(/c-(\d+)-(\d+)/);
  if (!idMatch) {
    return line;
  }
  const id1 = parseInt(idMatch[1]);
  const id2 = parseInt(idMatch[2]);

  if (
    (removedNodes?.has(id1) && (nodes.has(id2) || removedNodes.has(id2))) ||
    (removedNodes?.has(id2) && (nodes.has(id1) || removedNodes.has(id1)))
  ) {
    return line.slice(undefined, line.length - 2) + " removed />";
  }

  if (!nodes.has(id1) || !nodes.has(id2)) {
    const isAscendancy = ascendancies.some((asc) => line.includes(asc));
    for (const asc of ascendancies) {
      if (line.includes(asc)) {
        line = line.replace("ascendancy", "");
      }
    }
    if (isAscendancy) {
      return line;
    } else {
      return "";
    }
  }
  if (changeLineStyle) {
    const style = changeLineStyle(id1, id2);
    if (style) {
      return (
        line.slice(undefined, line.length - 2) + ` style="${style}"` + " />"
      );
    }
  }
  if (
    (newNodes?.has(id1) && (newNodes?.has(id2) || nodes.has(id2))) ||
    (newNodes?.has(id2) && (newNodes?.has(id1) || nodes.has(id1)))
  ) {
    return line.slice(undefined, line.length - 2) + " added />";
  }

  return line.slice(undefined, line.length - 2) + ` active />`;
}

function filterActiveNodes(
  line: string,
  nodes: Set<number>,
  ascendancies: string[],
  changeNodeStyle?: (node: number) => string,
  newNodes?: Set<number>,
  removedNodes?: Set<number>,
): string {
  const idMatch = line.match(/id="n-(\d+)"/);
  if (!idMatch) {
    return line;
  }

  const nodeId = parseInt(idMatch[1]);
  if (removedNodes?.has(nodeId)) {
    return line.slice(undefined, line.length - 2) + " removed />";
  }
  if (!nodes.has(nodeId)) {
    const isAscendancy = ascendancies.some((asc) => line.includes(asc));
    for (const asc of ascendancies) {
      if (line.includes(asc)) {
        line = line.replace("ascendancy", "");
      }
    }
    if (isAscendancy) {
      return line;
    } else {
      return "";
    }
  }
  line = line.replace(`id="n`, `id="xn`);
  if (changeNodeStyle) {
    const style = changeNodeStyle(nodeId);
    if (style) {
      return (
        line.slice(undefined, line.length - 2) + ` style="${style}"` + " />"
      );
    }
  }
  if (newNodes?.has(nodeId)) {
    return line.slice(undefined, line.length - 2) + " added />";
  }

  return line.slice(undefined, line.length - 2) + " active />";
}

function filterActiveTree(
  data: string,
  nodes: Set<number>,
  ascendancies: string[],
  changeNodeStyle?: (node: number) => string,
  changeLineStyle?: (node1: number, node2: number) => string,
  newNodes?: Set<number>,
  removedNodes?: Set<number>,
): string {
  var atConnectors = false;
  var atNodes = false;
  const newData = [];
  for (let line of data.split("\n")) {
    if (line.includes("<g")) {
      atConnectors = !atConnectors;
      atNodes = !atConnectors;
      newData.push(line);
      continue;
    }
    if (atConnectors) {
      line = filterActiveConnections(
        line,
        nodes,
        ascendancies,
        changeLineStyle,
        newNodes,
        removedNodes,
      );
    } else if (atNodes) {
      line = filterActiveNodes(
        line,
        nodes,
        ascendancies,
        changeNodeStyle,
        newNodes,
        removedNodes,
      );
    }
    newData.push(line);
  }
  return newData.join("\n");
}

export default function Tree({
  version,
  nodes,
  masteryMap = {},
  type,
  index = -1,
  ascendancies = [],
  nodeCounts,
  showUnallocated = true,
  tooltip = false,
  changeNodeStyle,
  changeLineStyle,
  selectedNodes,
  setSelectedNodes,
  newNodes,
  removedNodes,
  ...props
}: Props) {
  console.log(masteryMap);

  const [hoveredNode, setHoveredNode] = useState<number>();
  const [nodeCoordinates, setNodeCoordinates] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const baseTreeRef = useRef<HTMLDivElement>(null);
  const activeTreeRef = useRef<HTMLDivElement>(null);
  const { data: svg } = useFile<string>(
    `/assets/trees/svg/${type}/${version}.svg`,
    "text",
  );
  const { data: json } = useFile<CompactTree>(
    `/assets/trees/json/${type}/${version}.json`,
  );
  const bloodline = Object.entries(json?.nodes || {})
    .filter(
      ([key, node]) =>
        nodes.has(Number(key)) && node.name?.includes("Bloodline"),
    )
    .map(([key, node]) => node.name?.replaceAll(" Bloodline", ""))?.[0];

  if (bloodline) {
    ascendancies.push(bloodline);
  }
  if (type === "atlas") {
    nodes.add(29045); // add root node
    if (nodeCounts) {
      nodeCounts[29045] = 1;
    }
  }

  const baseTree = useMemo(() => {
    if (!svg || !showUnallocated) {
      return "";
    }
    return <div dangerouslySetInnerHTML={{ __html: svg || "" }} />;
  }, [svg, showUnallocated]);

  const newTree = useMemo(() => {
    if (!svg || nodes.size === 0) {
      return "";
    }
    return (
      <div
        ref={activeTreeRef}
        className="absolute inset-0"
        dangerouslySetInnerHTML={{
          __html: filterActiveTree(
            svg,
            nodes,
            ascendancies,
            changeNodeStyle,
            changeLineStyle,
            newNodes,
            removedNodes,
          ),
        }}
      />
    );
  }, [svg, nodes, ascendancies]);

  useEffect(() => {
    if (!tooltip || !activeTreeRef.current) {
      return;
    }
    const cleanupFunctions: (() => void)[] = [];
    const container = activeTreeRef.current;
    const containerLeaveHandler = () => {
      setHoveredNode(undefined);
    };
    container.addEventListener("mouseleave", containerLeaveHandler);
    cleanupFunctions.push(() => {
      container.removeEventListener("mouseleave", containerLeaveHandler);
    });

    for (const element of activeTreeRef.current.getElementsByTagName(
      "circle",
    )) {
      const node = parseInt(element.id.replace("xn-", ""), 10);
      if (selectedNodes?.has(node)) {
        element.setAttribute("selected", "");
      } else {
        element.removeAttribute("selected");
      }
      const clickHandler = (e: Event) => {
        if (selectedNodes?.has(node)) {
          const newSet = new Set(selectedNodes);
          newSet.delete(node);
          setSelectedNodes && setSelectedNodes(newSet);
          e.stopPropagation();
          return;
        }
        setSelectedNodes &&
          setSelectedNodes(new Set([...(selectedNodes || []), node]));
        e.stopPropagation();
      };
      const hoverHandler = () => {
        setHoveredNode(node);
        const rect = element.getBoundingClientRect();
        setNodeCoordinates({ x: rect.x, y: rect.y });
      };
      const hoverOutHandler = () => {
        setHoveredNode(undefined);
      };
      element.addEventListener("click", clickHandler);
      element.addEventListener("mouseenter", hoverHandler);
      element.addEventListener("mouseleave", hoverOutHandler);
      cleanupFunctions.push(() => {
        element.removeEventListener("click", clickHandler);
        element.removeEventListener("mouseenter", hoverHandler);
        element.removeEventListener("mouseleave", hoverOutHandler);
      });
    }
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [newTree, tooltip, selectedNodes, setSelectedNodes]);

  function renderNodeDetails(
    nodeId?: number,
    nodeCoordinates?: { x: number; y: number },
  ) {
    console.log("renderNodeDetails", nodeId);
    if (!json || !nodeId || !nodeCoordinates) {
      return;
    }
    const node = json.nodes[nodeId];
    if (!node || !node.name) {
      return;
    }
    return (
      <div
        className="pointer-events-none fixed z-50 rounded-box border-2 border-highlight bg-base-300/95"
        style={{
          top: nodeCoordinates.y + 20,
          left: nodeCoordinates.x - 200,
          width: 400,
        }}
      >
        <div className="p-2">
          <h2 className="text-center text-lg font-bold">{node.name}</h2>
          <div className="p-1">
            {node.stats && node.stats.length > 0 && (
              <ul className="text-left">
                {node.stats.map((stat, index) => (
                  <li key={index}>{stat}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 rounded-box">
      <div
        {...props}
        className={twMerge(
          "passiveTree aspect-square w-full p-2",
          props.className,
        )}
      >
        <div {...props} className={twMerge("relative", props.className)}>
          {baseTree}
          {newTree}
        </div>
      </div>
      {renderNodeDetails(
        hoveredNode ? masteryMap[hoveredNode] || hoveredNode : undefined,
        nodeCoordinates,
      )}
    </div>
  );
}
