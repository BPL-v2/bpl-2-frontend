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
  for (let i = 0; i <= 1; i += 0.05) {
    colorSegments.push({
      value: i,
      color: calculateColor(i),
    });
  }

  return (
    <div>
      <div className="">
        <div className="mb-2 text-sm">Node Frequency</div>
        <div className="flex gap-2">
          <span className="text-xs">0%</span>
          <div className="flex h-4 flex-1 overflow-hidden rounded-full">
            {colorSegments.map((segment, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: segment.color }}
                title={`${(segment.value * 100).toFixed(0)}%`}
              ></div>
            ))}
          </div>
          <span className="text-xs">100%</span>
        </div>
        <div className="mt-2 text-sm">
          {filteredNodes} Atlas Tree{filteredNodes === 1 ? "" : "s"}
        </div>
        <div
          className="mt-2 cursor-pointer text-sm text-info hover:underline"
          onClick={() => setSelectedNodes(new Set())}
        >
          Unselect all
        </div>
      </div>
      <Tree
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
