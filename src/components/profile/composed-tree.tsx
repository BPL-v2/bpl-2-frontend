import Tree from "./tree";

type Props = {
  version: string;
  nodes: Set<number>[];
  type: "atlas" | "passives";
  selectedNodes: Set<number>;
  setSelectedNodes: (nodes: Set<number>) => void;
};

function calculateColor(value: number): string {
  value = Math.max(0, Math.min(1, value));
  if (value === 0) {
    return `hsl(0, 0%, 50%)`;
  }
  const saturation = Math.floor(value * 100);
  const lightness = 50;
  if (value <= 0.5) {
    const hue = 120;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else {
    const hue = Math.floor(240 * (1 - value));
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}
export function ComposedTree({
  version,
  nodes,
  type,
  selectedNodes,
  setSelectedNodes,
}: Props) {
  const nodeCounts: Record<number, number> = {};
  const allNodes = new Set<number>();
  let skip = false;
  let filteredNodes = 0;
  for (const nodeSet of nodes) {
    if (type === "atlas") {
      nodeSet.add(29045); // add root node
    }

    skip = false;
    for (const node of selectedNodes) {
      if (!nodeSet.has(node)) {
        skip = true;
        break;
      }
    }
    if (skip) {
      continue;
    }
    filteredNodes += 1;
    for (const node of nodeSet) {
      nodeCounts[node] = (nodeCounts[node] || 0) + 1;
      allNodes.add(node);
    }
  }
  for (const [nodeId, count] of Object.entries(nodeCounts)) {
    nodeCounts[Number(nodeId)] = count / filteredNodes;
  }

  const changeNodeStyle = (nodeId: number): string => {
    if (nodeCounts && nodeCounts[nodeId] !== undefined) {
      const value = nodeCounts[nodeId];
      return `fill: ${calculateColor(value)}`;
    }
    return "";
  };
  const changeLineStyle = (node1: number, node2: number): string => {
    if (
      nodeCounts &&
      nodeCounts[node1] !== undefined &&
      nodeCounts[node2] !== undefined
    ) {
      const value = Math.min(nodeCounts[node1], nodeCounts[node2]);
      return `stroke: ${calculateColor(value)}`;
    }
    return "";
  };
  const colorSegments = [];
  for (let i = 0; i <= 1; i += 0.025) {
    colorSegments.push({
      value: i,
      color: calculateColor(i),
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="relative text-xs font-extrabold text-black">
          <div className="absolute flex w-full flex-row justify-between px-2">
            <span>0%</span>
            <span>Node Frequency</span>
            <span>100%</span>
          </div>
          <div className="flex h-4 flex-1 overflow-hidden rounded-full">
            {colorSegments.map((segment, index) => (
              <div
                key={index}
                className="flex-1 px-2"
                style={{ backgroundColor: segment.color }}
                title={`${(segment.value * 100).toFixed(0)}%`}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex flex-row justify-center gap-4 text-xs">
          <span>
            {filteredNodes} Atlas Tree{filteredNodes === 1 ? "" : "s"}
          </span>
          <span
            className="cursor-pointer text-info hover:underline"
            onClick={() => setSelectedNodes(new Set())}
          >
            Unselect all
          </span>
        </div>
      </div>
      <Tree
        className="-mt-1"
        version={version}
        nodes={allNodes}
        type={type}
        changeNodeStyle={changeNodeStyle}
        changeLineStyle={changeLineStyle}
        selectedNodes={selectedNodes}
        setSelectedNodes={setSelectedNodes}
        tooltip={true}
      />
    </div>
  );
}
