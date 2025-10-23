export type CompactTree = {
  groups: Record<string, CompactGroup>;
  nodes: Record<string, CompactNode>;
};

type CompactGroup = {
  nodes: string[];
};

type CompactNode = {
  name?: string;
  stats?: string[];
};
