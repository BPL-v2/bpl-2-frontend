import { useFile } from "@client/query";
import { useMemo } from "react";

type Props = {
  version: string;
  nodes: Set<number>;
};

function manipulateConnectorData(line: string, nodes: Set<number>): string {
  const idMatch = line.match(/c-(\d+)-(\d+)/);
  if (!idMatch) {
    return line;
  }
  const id1 = parseInt(idMatch[1]);
  const id2 = parseInt(idMatch[2]);
  var attr = "";
  if (!nodes.has(id1) || !nodes.has(id2)) {
    if (line.includes("Elementalist")) {
      attr = "shown";
    }
  } else {
    attr = "active";
  }
  return line.slice(undefined, line.length - 2) + ` ${attr} />`;
}

function manipulateNodeData(line: string, nodes: Set<number>): string {
  const idMatch = line.match(/id="n-(\d+)"/);
  if (!idMatch) {
    return line;
  }
  const nodeId = parseInt(idMatch[1]);
  if (!nodes.has(nodeId)) {
    if (line.includes("Elementalist")) {
      return line.replace("ascendancy", "");
    }
    return line;
  }
  return line.slice(undefined, line.length - 2) + " active />";
}

function manipulateSvgData(data: string, nodes: Set<number>): string {
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
      line = manipulateConnectorData(line, nodes);
    } else if (atNodes) {
      line = manipulateNodeData(line, nodes);
    }
    newData.push(line);
  }
  return newData.join("\n");
}

export default function Tree({ version, nodes }: Props) {
  const { data } = useFile<string>(`/assets/trees/${version}.svg`, "text");
  const newData = useMemo(() => {
    if (!data || nodes.size === 0) {
      return "";
    }
    return manipulateSvgData(data, nodes);
  }, [data, nodes]);

  return (
    <div
      className="passiveTree w-50 rounded-box border-2 border-base-300 bg-base-200 p-1"
      dangerouslySetInnerHTML={{ __html: newData }}
    />
  );
}
