export type StashTabLayoutItem = {
  x: number;
  y: number;
  w: number;
  h: number;
  section?: string;
  scale?: number;
  hidden?: true;
};

export type StashTabLayout = {
  [coords: string]: StashTabLayoutItem;
};

export type StashTabLayoutWrapper =
  | true
  | {
      [coords: string]: StashTabLayoutItem;
    }
  | {
      sections: string[];
      layout: {
        [coords: string]: StashTabLayoutItem;
      };
    };

export function getLayout(
  stashType?: string,
  layout?: StashTabLayoutWrapper,
): StashTabLayout | undefined {
  if (!layout) return undefined;
  if (typeof layout === "boolean") {
    const stashSize = stashType === "PremiumStash" ? 12 : 24;
    const layoutObj: Record<string, StashTabLayoutItem> = {};
    for (let i = 0; i < stashSize; i++) {
      for (let j = 0; j < stashSize; j++) {
        layoutObj[`${i},${j}`] = {
          x: i * 25 + 2,
          y: j * 25 + 2,
          w: 1,
          h: 1,
          scale: 0.55,
        };
      }
    }
    return layoutObj;
  }
  if (layout.layout) {
    return layout.layout as StashTabLayout;
  }
  return layout as StashTabLayout;
}
