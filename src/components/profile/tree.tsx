import { useFile } from "@client/query";
import { CompactTree } from "@mytypes/tree";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  version: string;
  nodes: Set<number>;
  type: "atlas" | "passives";
  index?: number;
  showUnallocated?: boolean;
  ascendancy?: string;
  tooltip?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

function filterActiveConnections(
  line: string,
  nodes: Set<number>,
  ascendancy?: string,
): string {
  const idMatch = line.match(/c-(\d+)-(\d+)/);
  if (!idMatch) {
    return line;
  }
  const id1 = parseInt(idMatch[1]);
  const id2 = parseInt(idMatch[2]);
  if (!nodes.has(id1) || !nodes.has(id2)) {
    if (ascendancy && line.includes(ascendancy)) {
      return line.replace("ascendancy", "");
    } else {
      return "";
    }
  }
  return line.slice(undefined, line.length - 2) + ` active />`;
}

function filterActiveNodes(
  line: string,
  nodes: Set<number>,
  ascendancy?: string,
): string {
  const idMatch = line.match(/id="n-(\d+)"/);
  if (!idMatch) {
    return line;
  }
  if (line.includes("mastery")) {
    // const circleMatch = line.match(
    //   /<circle[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*>/,
    // );
    // if (circleMatch) {
    //   const cx = parseFloat(circleMatch[1]) - 80;
    //   const cy = parseFloat(circleMatch[2]) - 80;
    //   return `<g transform="translate(${cx}, ${cy}) scale(0.8)" filter="grayscale(1)">${svg}</g>`;
    // }
  }

  const nodeId = parseInt(idMatch[1]);
  if (!nodes.has(nodeId)) {
    if (ascendancy && line.includes(ascendancy)) {
      return line.replace("ascendancy", "");
    }
    return "";
  }
  line = line.replace(`id="n`, `id="xn`);
  return line.slice(undefined, line.length - 2) + " active />";
}

function filterActiveTree(
  data: string,
  nodes: Set<number>,
  ascendancy?: string,
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
      line = filterActiveConnections(line, nodes, ascendancy);
    } else if (atNodes) {
      line = filterActiveNodes(line, nodes, ascendancy);
    }
    newData.push(line);
  }
  return newData.join("\n");
}

export default function Tree({
  version,
  nodes,
  type,
  index = -1,
  ascendancy,
  showUnallocated = true,
  tooltip = false,
  ...props
}: Props) {
  const [hoveredNode, setHoveredNode] = useState<number>();
  const [selectedNode, setSelectedNode] = useState<number>();
  const [selectedElement, setSelectedElement] = useState<HTMLElement>();
  const { data: svg } = useFile<string>(
    `/assets/trees/svg/${type}/${version}.svg`,
    "text",
  );
  const { data: json } = useFile<CompactTree>(
    `/assets/trees/json/${type}/${version}.json`,
  );

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
        className="absolute inset-0"
        dangerouslySetInnerHTML={{
          __html: filterActiveTree(svg, nodes, ascendancy),
        }}
      />
    );
  }, [svg, nodes]);
  useEffect(() => {
    if (!tooltip) {
      return;
    }
    const cleanupFunctions: (() => void)[] = [];
    const windowClickHandler = () => {
      setSelectedNode(undefined);
      selectedElement?.setAttribute("style", "fill: var(--color-info)");
      setSelectedElement(undefined);
    };
    window.addEventListener("click", windowClickHandler);
    cleanupFunctions.push(() => {
      window.removeEventListener("click", windowClickHandler);
    });
    for (const node of nodes) {
      const element = document.getElementById(`xn-${node}`);
      if (element) {
        const clickHandler = (e: Event) => {
          setSelectedNode(node);
          selectedElement?.setAttribute("style", "fill: var(--color-info)");
          element.setAttribute("style", "fill: red");
          setSelectedElement(element);
          e.stopPropagation();
        };
        const hoverHandler = () => {
          setHoveredNode(node);
        };
        const hoverOutHandler = () => {
          setHoveredNode(undefined);
        };
        element.addEventListener("click", clickHandler);
        element.addEventListener("mouseover", hoverHandler);
        element.addEventListener("mouseout", hoverOutHandler);
        cleanupFunctions.push(() => {
          element.removeEventListener("click", clickHandler);
          element.removeEventListener("mouseover", hoverHandler);
          element.removeEventListener("mouseout", hoverOutHandler);
        });
      }
    }
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [newTree, tooltip, selectedElement]);

  if (type === "atlas") {
    nodes.add(29045); // add root node
  }

  function renderNodeDetails(nodeId?: number) {
    if (!json || !nodeId) {
      return null;
    }
    const node = json.nodes[nodeId];
    if (!node) {
      return <div>No data for node {nodeId}</div>;
    }
    return (
      <div className="p-6">
        <h2 className="text-center text-2xl font-bold">{node.name}</h2>
        <div className="p-4">
          {node.stats && node.stats.length > 0 && (
            <ul className="text-left text-lg">
              {node.stats.map((stat, index) => (
                <li key={index}>{stat}</li>
              ))}
            </ul>
          )}
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
        <div {...props} className={"relative"}>
          {baseTree}
          {newTree}
        </div>
      </div>
      {tooltip && (
        <div className="m-4 mx-8 h-full w-full rounded-box bg-base-200">
          {(hoveredNode || selectedNode) && (
            <div className="p-4">
              {selectedNode
                ? renderNodeDetails(selectedNode)
                : renderNodeDetails(hoveredNode)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
