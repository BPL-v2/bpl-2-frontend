import React, { useEffect, useMemo, useState } from "react";
import { DisplayItem, GuildStashTabGGG } from "@client/api";
import {
  getLayout,
  StashTabLayout,
  StashTabLayoutItem,
  StashTabLayoutWrapper,
} from "@utils/stash-tabs";

type Props = {
  tab?: GuildStashTabGGG;
  size?: number;
  onItemClick?: (item: DisplayItem) => void;
  highlightScoring?: boolean;
};

function getMapping(
  item: DisplayItem,
  layout: StashTabLayout,
): StashTabLayoutItem | undefined {
  const key = layout[`${item.x},${item.y}`]
    ? `${item.x},${item.y}`
    : `${item.x}`;
  return layout[key];
}

function getStyle(
  mapping: StashTabLayoutItem,
  size: number,
): React.CSSProperties {
  const itemSize = size / 14;
  const canvasSize = size / 600; // Base size for the layout
  return {
    left: (mapping.x ?? 1) * canvasSize,
    top: (mapping.y ?? 1) * canvasSize,
    width: (mapping.w ?? 1) * itemSize * (mapping.scale ?? 1),
    height: (mapping.h ?? 1) * itemSize * (mapping.scale ?? 1),
  };
}

export const StashTabSpecial: React.FC<Props> = ({
  tab,
  size = 1000,
  onItemClick,
  highlightScoring,
}) => {
  const layout = getLayout(
    tab?.type,
    tab?.metadata?.layout as StashTabLayoutWrapper,
  );

  // Collect all unique sections from the layout, but only keep those with at least one non-hidden layout item
  const sections = useMemo(() => {
    if (!layout) return [];
    return Array.from(
      new Set(
        Object.values(layout)
          .filter((mapping) => !mapping.hidden)
          .map((mapping) => mapping.section)
          .filter((section) => section !== undefined),
      ),
    );
  }, [layout]);
  // Section state
  const [selectedSection, setSelectedSection] = useState<string>(
    sections.length > 0 ? sections[0] : "",
  );

  useEffect(() => {
    // Reset selected section when sections change
    if (sections.length > 0) {
      setSelectedSection(sections[0]);
    } else {
      setSelectedSection("");
    }
  }, [sections]);
  const items = useMemo(() => {
    return (
      tab?.items?.filter((item) => {
        if (highlightScoring && !item.objectiveId) {
          return false;
        }
        return true;
      }) || []
    );
  }, [tab?.items, highlightScoring]);
  if (!tab || !tab.metadata || !layout) return null;

  // Filter layout by section if sections exist
  const filteredLayout =
    sections.length > 0
      ? Object.entries(layout).filter(
          ([, mapping]) =>
            !mapping.hidden &&
            (mapping.section === selectedSection ||
              mapping.section === undefined),
        )
      : Object.entries(layout).filter(([, mapping]) => !mapping.hidden);

  // Filter items by section if sections exist
  const filteredItems =
    sections.length > 0
      ? items.filter((item) => {
          const mapping = getMapping(item, layout);
          return (
            mapping &&
            !mapping.hidden &&
            (mapping.section === selectedSection ||
              mapping.section === undefined)
          );
        })
      : items.filter((item) => {
          const mapping = getMapping(item, layout);
          return mapping && !mapping.hidden;
        });
  return (
    <div className="relative">
      {sections.length > 0 && (
        <div className="absolute top-2 left-2 z-10 mb-4 join">
          {sections.map((section) => (
            <button
              key={section}
              className={`btn join-item btn-sm ${
                selectedSection === section ? "btn-primary" : "bg-base-300"
              }`}
              onClick={() => setSelectedSection(section)}
              type="button"
            >
              {section}
            </button>
          ))}
        </div>
      )}
      <div
        className="relative rounded-lg border border-base-300 bg-base-200"
        style={{ width: size, height: size }}
      >
        {filteredLayout.map(([key, mapping]: [string, StashTabLayoutItem]) => {
          return (
            <div
              id={`empty-${key}`}
              key={`empty-${key}`}
              className="absolute rounded border border-base-200 bg-base-300 select-none"
              style={{
                ...getStyle(mapping, size),
                pointerEvents: "none",
              }}
            />
          );
        })}

        {filteredItems?.map((item, idx) => {
          const mapping = getMapping(item, layout);
          if (!mapping) return null;
          mapping.w = Math.max(mapping.w, item.w || 1);
          mapping.h = Math.max(mapping.h, item.h || 1);
          return (
            <div
              key={idx}
              className="absolute flex cursor-pointer items-center justify-center rounded border border-base-300 bg-base-100 p-1 select-none"
              style={getStyle(mapping, size)}
              onClick={() => onItemClick?.(item)}
            >
              <div
                className="tooltip-white tooltip relative tooltip-bottom cursor-pointer"
                data-tip={`${item.name} ${item.typeLine}`}
              >
                <img
                  src={item.icon!}
                  alt={item.name}
                  tabIndex={0}
                  className="max-h-full max-w-full object-contain"
                />{" "}
                <div
                  className={
                    "absolute top-[2px] left-[2px] text-xs text-white select-none"
                  }
                >
                  {(item.stackSize || 0) > 0 ? item.stackSize : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
