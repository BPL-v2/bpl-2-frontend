// Portions of this file are derived from pasteofexile (https://github.com/Dav1dde/pasteofexile)
// Licensed under GNU AGPL v3.0: https://www.gnu.org/licenses/agpl-3.0.html
// Copyright (c) Dav1dde and contributors
import { useFile } from "@client/query";
import { AscendancyPortrait } from "@components/character/ascendancy-portrait";
import {
  ArrowsPointingInIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { InventoryIcon } from "@icons/inventory-icons";
import { encode } from "@mytypes/scoring-objective";
import {
  decodePoBExport,
  Gem,
  Item,
  PathOfBuilding,
  Rarity,
  Skill,
} from "@utils/pob";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Tree from "./tree";

function getLink(item: Item) {
  let link = "/assets/poe1/items/";
  if (item.rarity === Rarity.Unique) {
    link += "uniques/" + encode(item.name) + ".webp";
  } else {
    link += "basetypes/" + encode(item.base.split(" (")[0]) + ".webp";
  }
  return link;
}

type Props = {
  pobString?: string;
};

function ItemTooltip({
  item,
  itemX,
  itemY,
}: {
  item?: Item;
  itemX?: number;
  itemY?: number;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    left: itemX,
    top: (itemY || 0) > 10 ? itemY : 10,
    maxWidth: 320,
  });
  useEffect(() => {
    setPosition({
      left: itemX,
      top: (itemY || 0) > 10 ? itemY : 10,
      maxWidth: 320,
    });
  }, [item, itemX, itemY]);

  useEffect(() => {
    if (!tooltipRef.current) return;

    let top = position.top;
    let left = position.left;
    if (
      window.innerHeight < tooltipRef.current.getBoundingClientRect().bottom
    ) {
      top = window.innerHeight - tooltipRef.current!.offsetHeight - 10;
    }
    if (window.innerWidth < tooltipRef.current.getBoundingClientRect().right) {
      left = window.innerWidth - tooltipRef.current!.offsetWidth - 30;
    }
    setPosition((pos) => ({ ...pos, left, top }));
  }, [position.left, position.top]);

  if (!item) return null;

  let headerColor = "";
  let borderColor = "";
  switch (item.rarity) {
    case Rarity.Unique:
      headerColor = "text-unique";
      borderColor = "border-unique";
      break;
    case Rarity.Rare:
      headerColor = "text-rare";
      borderColor = "border-rare";
      break;
    case Rarity.Magic:
      headerColor = "text-magic";
      borderColor = "border-magic";
      break;
    case Rarity.Normal:
      headerColor = "text-normal";
      borderColor = "border-normal";
      break;
  }
  return (
    <div
      ref={tooltipRef}
      className={twMerge(
        "pointer-events-none fixed z-30 text-xs md:text-base",
        "gap flex flex-col rounded-lg border-2 bg-base-100/80 text-center shadow-lg md:bg-base-100/90",
        position.left != 0 && position.top != 0 ? "block" : "hidden",
        borderColor,
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: position.maxWidth,
        maxHeight: "90vh",
      }}
    >
      <div
        className={twMerge(
          "flex w-full flex-col p-2 text-sm font-bold md:text-xl",
          headerColor,
        )}
      >
        <p>{item.name}</p>
        <p>{item.name.includes(item.base) ? "" : item.base}</p>
      </div>
      {(item.armour > 0 ||
        item.evasion > 0 ||
        item.energyShield > 0 ||
        item.quality > 0) && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.quality > 0 && (
            <div>
              <span className="text-base-content/70">
                Quality{item.altQuality ? ` (${item.altQuality})` : ""}:{" "}
              </span>
              <span className="text-magic">+{item.quality}% </span>
            </div>
          )}
          {item.armour > 0 && (
            <div>
              <span className="text-base-content/70">Armour: </span>
              <span className="text-magic">{item.armour} </span>
            </div>
          )}
          {item.evasion > 0 && (
            <div>
              <span className="text-base-content/70">Evasion Rating: </span>
              <span className="text-magic">{item.evasion} </span>
            </div>
          )}
          {item.energyShield > 0 && (
            <div>
              <span className="text-base-content/70">Energy Shield: </span>
              <span className="text-magic">{item.energyShield} </span>
            </div>
          )}
        </div>
      )}
      {item.implicits.length > 0 && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.implicits.map((implicit) => (
            <span
              key={implicit.line}
              className={implicit.crafted ? "text-crafted" : "text-magic"}
            >
              {implicit.line}
            </span>
          ))}
        </div>
      )}
      {item.explicits.length > 0 && (
        <div
          className={twMerge(
            "flex w-full flex-col border-t-2 p-2 md:gap-1",
            borderColor,
          )}
        >
          {item.explicits.map((explicit) => (
            <span
              key={explicit.line}
              className={
                explicit.crafted
                  ? "text-crafted"
                  : explicit.fractured
                    ? "text-fractured"
                    : "text-magic"
              }
            >
              {explicit.line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type ItemDisplayProps = {
  item?: Item;
  slot: string | null;
  selectionSetter: (item?: Item) => void;
  setMousePosition: (pos?: { x: number; y: number }) => void;
};

function ItemDisplay({
  item,
  slot,
  selectionSetter,
  setMousePosition,
}: ItemDisplayProps) {
  const itemRef = useRef<HTMLImageElement>(null);
  if (!slot) {
    slot = item?.slot || "Unknown";
  }
  const handleMouseEnter = () => {
    if (!item || !itemRef.current) return;
    selectionSetter(item);
    const rect = itemRef.current.getBoundingClientRect();
    setMousePosition({
      x: rect.right + 10,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    selectionSetter(undefined);
    setMousePosition(undefined);
  };
  return (
    <div
      key={"item-" + slot}
      className={twMerge(
        "relative flex h-full w-full items-center justify-center rounded-lg bg-base-200 p-1",
        item && "cursor-help",
        slot.replaceAll(" ", "").toLowerCase(),
      )}
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item && (
        <img
          className="flex h-full w-full items-center object-contain p-1"
          src={getLink(item)}
          alt={item?.name}
        />
      )}
    </div>
  );
}

export function PoB({ pobString }: Props) {
  const { data: gemColors } = useFile<Record<"r" | "g" | "b" | "w", string[]>>(
    "/assets/poe1/items/gem_colors.json",
  );
  const [treeExpanded, setTreeExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [itemPosition, setItemPosition] = useState<{
    x: number;
    y: number;
  }>();
  const [showEhpTooltip, setShowEhpTooltip] = useState(false);
  const equipmentSlots = [
    "Helmet",
    "Body Armour",
    "Gloves",
    "Boots",
    "Belt",
    "Amulet",
    "Ring 1",
    "Ring 2",
    "Weapon 1",
    "Weapon 2",
  ];
  const pob = useMemo(() => decodePoBExport(pobString), [pobString]);

  const flaskSlots = ["Flask 1", "Flask 2", "Flask 3", "Flask 4", "Flask 5"];
  const jewels: Item[] = [];
  const equipment: Record<string, Item | undefined> = equipmentSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>,
  );
  const flasks: Record<string, Item | undefined> = flaskSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>,
  );
  for (const item of pob.items) {
    if (!item.slot) continue;
    if (item.slot.includes("Abyssal") || item.slot.includes("Socket")) {
      jewels.push(item);
    } else if (equipmentSlots.includes(item.slot)) {
      equipment[item.slot] = item;
    } else if (flaskSlots.includes(item.slot)) {
      flasks[item.slot] = item;
    }
  }
  const characterClass =
    pob.build.ascendClassName != "None"
      ? pob.build.ascendClassName
      : pob.build.className;
  const highestDps = Math.max(
    pob.build.playerStats.combinedDPS,
    pob.build.playerStats.cullingDPS,
    pob.build.playerStats.fullDPS,
    pob.build.playerStats.fullDotDPS,
    pob.build.playerStats.fullDotDPS,
    pob.build.playerStats.totalDPS,
    pob.build.playerStats.totalDot,
    pob.build.playerStats.totalDotDPS,
    pob.build.playerStats.withBleedDPS,
    pob.build.playerStats.withIgniteDPS,
    pob.build.playerStats.withPoisonDPS,
  );
  const tree = useMemo(() => {
    if (!pob.spec.nodes) return null;
    return (
      <div
        className={
          treeExpanded ? "" : "w-[40%] cursor-zoom-in rounded-box bg-base-300"
        }
      >
        <Tree
          version={pob.spec.treeVersion}
          nodes={pob.spec.nodes}
          type="passives"
          ascendancy={pob.build.ascendClassName}
          children=" "
          tooltip={treeExpanded}
          // className={"h-[75vh] w-[75vh]"}
          showUnallocated={true}
          onClick={() => setTreeExpanded(true)}
        />
      </div>
    );
  }, [pob.spec.nodes, pob.build.ascendClassName, treeExpanded]);
  if (!pobString) {
    return null;
  }
  return (
    <>
      {selectedItem && (
        <ItemTooltip
          item={selectedItem}
          itemX={itemPosition?.x}
          itemY={itemPosition?.y}
        />
      )}
      <div className="flex flex-col gap-4">
        {treeExpanded && (
          <div className="relative w-full rounded-box bg-base-300 p-4">
            {tree}
            <ArrowsPointingInIcon
              className="absolute top-2 right-2 size-8 cursor-pointer rounded-full border-2 border-base-content p-1 hover:border-info hover:text-info"
              onClick={() => setTreeExpanded(false)}
            />
          </div>
        )}

        <div className="flex min-h-170 flex-col gap-4 text-left lg:flex-row">
          <div className="flex w-full justify-center rounded-box bg-base-300 p-4 select-none lg:w-[40%] lg:p-8">
            <div className="inventory m-auto mt-0 gap-1 md:gap-2">
              {Object.entries(equipment).map(([slot, item]) => (
                <ItemDisplay
                  key={slot}
                  item={item}
                  slot={slot}
                  selectionSetter={setSelectedItem}
                  setMousePosition={setItemPosition}
                />
              ))}
              <div className="flasks">
                {Object.entries(flasks).map(([slot, item]) => (
                  <ItemDisplay
                    key={slot}
                    item={item}
                    slot={slot}
                    selectionSetter={setSelectedItem}
                    setMousePosition={setItemPosition}
                  />
                ))}
              </div>
              <div className="col-span-full"></div>
              {jewels.map((item) => {
                return (
                  <ItemDisplay
                    key={item.id}
                    item={item}
                    slot={item?.slot}
                    selectionSetter={setSelectedItem}
                    setMousePosition={setItemPosition}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-row gap-4">
              {!treeExpanded && tree}
              <div className="flex w-full flex-col gap-2 rounded-box bg-base-300 p-4 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="mb-1 flex items-center gap-4 text-xl">
                    <AscendancyPortrait
                      character_class={characterClass}
                      className="size-14 rounded-full object-cover"
                    />
                    <h1>
                      Level {pob.build.level}{" "}
                      {
                        pob.skills.skillSets[0].skills[
                          pob.build.mainSocketGroup - 1
                        ]?.gems.find(
                          (gem) => !gem.variantId.includes("Support"),
                        )?.nameSpec
                      }{" "}
                      {characterClass}
                    </h1>
                  </div>
                  <div title="Copy PoB to clipboard">
                    <ClipboardDocumentListIcon
                      className="size-8 cursor-pointer transition-transform duration-100 select-none hover:text-primary active:scale-110 active:text-secondary"
                      onClick={() => {
                        if (pobString) navigator.clipboard.writeText(pobString);
                      }}
                    />
                  </div>
                </div>
                <div className="justify-left flex flex-row flex-wrap gap-2">
                  <div>
                    Life:{" "}
                    <span className="text-health">
                      {pob.build.playerStats.life.toLocaleString()}
                    </span>
                  </div>
                  {pob.build.playerStats.energyShield > 0 && (
                    <div>
                      ES:{" "}
                      <span className="text-energy-shield">
                        {pob.build.playerStats.energyShield.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {pob.build.playerStats.mana > 0 && (
                    <div>
                      Mana:{" "}
                      <span className="text-mana">
                        {pob.build.playerStats.mana.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div
                    className="relative"
                    onMouseEnter={() => setShowEhpTooltip(true)}
                    onMouseLeave={() => setShowEhpTooltip(false)}
                  >
                    <span title="Total effective Health Pool">eHP: </span>
                    <span className="underline decoration-dotted">
                      {Math.round(
                        pob.build.playerStats.totalEHP,
                      ).toLocaleString()}
                    </span>
                    {showEhpTooltip && (
                      <div className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-60 -translate-x-1/2">
                        <div className="rounded-box bg-base-100 px-4 py-2 text-sm whitespace-pre-line shadow-lg">
                          <div>
                            <span>Physical Max Hit: </span>
                            <span className="">
                              {pob.build.playerStats.physicalMaximumHitTaken.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span>Fire Max Hit: </span>
                            <span className="text-fire">
                              {pob.build.playerStats.fireMaximumHitTaken.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span>Cold Max Hit: </span>
                            <span className="text-cold">
                              {pob.build.playerStats.coldMaximumHitTaken.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span>Lightning Max Hit: </span>
                            <span className="text-lightning">
                              {pob.build.playerStats.lightningMaximumHitTaken.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span>Chaos Max Hit: </span>
                            <span className="text-chaos">
                              {pob.build.playerStats.chaosMaximumHitTaken.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {(pob.build.playerStats.effectiveBlockChance > 20 ||
                    pob.build.playerStats.effectiveBlockChance > 20) && (
                    <div>
                      Block:{" "}
                      <span className="text-highlight-content">
                        <span title="Attack Block">
                          {" "}
                          {Math.round(
                            pob.build.playerStats.effectiveBlockChance,
                          )}
                          %
                        </span>
                        /
                        <span title="Spell Block">
                          {" "}
                          {Math.round(
                            pob.build.playerStats.effectiveSpellBlockChance,
                          )}
                          %
                        </span>
                      </span>
                    </div>
                  )}
                  {pob.build.playerStats.effectiveSpellSuppressionChance >
                    25 && (
                    <div>
                      Suppression:{" "}
                      <span className="text-highlight-content">
                        {Math.round(
                          pob.build.playerStats.effectiveSpellSuppressionChance,
                        )}
                        %
                      </span>
                    </div>
                  )}
                </div>
                <div className="justify-left flex flex-row flex-wrap gap-2">
                  <div>
                    Resistances:{" "}
                    <span className="text-fire">
                      {pob.build.playerStats.fireResist.toLocaleString()}%
                    </span>
                    /
                    <span className="text-cold">
                      {pob.build.playerStats.coldResist.toLocaleString()}%
                    </span>
                    /
                    <span className="text-lightning">
                      {pob.build.playerStats.lightningResist.toLocaleString()}%
                    </span>
                    /
                    <span className="text-chaos">
                      {pob.build.playerStats.chaosResist.toLocaleString()}%
                    </span>
                  </div>
                  {pob.build.playerStats.armour > 0 &&
                    pob.build.playerStats.physicalDamageReduction > 5 && (
                      <div>
                        Armour:{" "}
                        <span className="text-highlight-content">
                          {pob.build.playerStats.armour.toLocaleString()}
                        </span>
                      </div>
                    )}
                  {pob.build.playerStats.meleeEvadeChance > 5 && (
                    <div>
                      Evasion:{" "}
                      <span className="text-highlight-content">
                        {pob.build.playerStats.evasion.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {pob.build.playerStats.ward > 200 && (
                    <div>
                      Ward:{" "}
                      <span className="text-highlight-content">
                        {pob.build.playerStats.ward.toLocaleString()}
                      </span>
                    </div>
                  )}{" "}
                </div>
                <div className="flex flex-row gap-2">
                  <div>
                    DPS:{" "}
                    <span className="text-highlight-content">
                      {Math.round(highestDps).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    Speed:{" "}
                    <span className="text-highlight-content">
                      {pob.build.playerStats.speed?.toFixed(2)}
                    </span>
                  </div>
                  {pob.build.playerStats.critMultiplier > 1.6 && (
                    <>
                      <div>
                        Crit Chance:{" "}
                        <span className="text-highlight-content">
                          {pob.build.playerStats.critChance
                            ?.toFixed(2)
                            .toLocaleString()}
                          %
                        </span>
                      </div>
                      <div>
                        Crit Multi:{" "}
                        <span className="text-highlight-content">
                          {pob.build.playerStats.critMultiplier?.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  {pob.build.playerStats.effectiveMovementSpeedMod > 2 && (
                    <div>
                      Movement Speed:{" "}
                      <span className="text-highlight-content">
                        {Math.round(
                          pob.build.playerStats.effectiveMovementSpeedMod * 100,
                        )}
                        %
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-full columns-2 gap-2 rounded-box bg-base-300 p-4 text-sm md:p-8">
              {equipmentSlots
                .sort((slotA, slotB) => {
                  const mainGroup =
                    pob.skills.skillSets[0].skills[
                      pob.build.mainSocketGroup - 1
                    ];
                  if (mainGroup?.slot == slotA) return -1;
                  if (mainGroup?.slot == slotB) return 1;
                  const skillsA = pob.skills.skillSets[0].skills.filter(
                    (skill) => skill.slot === slotA,
                  );
                  const skillsB = pob.skills.skillSets[0].skills.filter(
                    (skill) => skill.slot === slotB,
                  );
                  return (
                    skillsB.flatMap((skill) => skill.gems).length -
                    skillsA.flatMap((skill) => skill.gems).length
                  );
                })
                .map((slot) => {
                  const skills = pob.skills.skillSets[0].skills.filter(
                    (skill) => skill.slot === slot,
                  );
                  if (skills.length === 0) return null;
                  return (
                    <div
                      className="relative mb-2 flex break-inside-avoid flex-col rounded-xl bg-base-200 px-3 py-2.5"
                      key={`skill-${slot}`}
                    >
                      <InventoryIcon
                        slot={slot}
                        className="absolute top-2 right-2"
                      />
                      <div key={slot} className="flex flex-col gap-2">
                        {skills.map((skill, skillId) => {
                          return (
                            <div
                              key={`skill-${slot}-${skillId}`}
                              className="flex flex-col"
                            >
                              {skill.gems.map((gem, gemId) => (
                                <SkillGem
                                  key={`gem-${slot}-${skillId}-${gemId}`}
                                  id={gemId}
                                  gem={gem}
                                  skillGroup={skill}
                                  pob={pob}
                                  gemColors={gemColors}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SkillGem({
  id,
  gem,
  skillGroup: skill,
  pob,
  gemColors,
}: {
  id: number;
  gem: Gem;
  skillGroup: Skill;
  pob: PathOfBuilding;
  gemColors?: Record<"r" | "g" | "b" | "w", string[]>;
}) {
  let text = getGemColor(gem, gemColors);
  let position = "";
  if (gem.skillId.includes("Support")) {
    position = id === skill.gems.length - 1 ? "gem-last" : "gem-middle";
  } else {
    if (isMainSkill(skill, pob)) {
      text += " font-bold";
    }
  }
  return (
    <span className={twMerge("truncate", position, text)}>{gem.nameSpec}</span>
  );
}

function isMainSkill(skill: Skill, pob: PathOfBuilding): boolean {
  const mainSkillGroup =
    pob.skills.skillSets[0].skills[pob.build.mainSocketGroup - 1];
  if (
    skill.slot !== mainSkillGroup.slot ||
    skill.gems.length !== mainSkillGroup.gems.length
  ) {
    return false;
  }
  for (let i = 0; i < skill.gems.length; i++) {
    if (skill.gems[i].gemId !== mainSkillGroup.gems[i].gemId) {
      return false;
    }
  }
  return true;
}

function getGemColor(
  gem: Gem,
  gemColors?: Record<"r" | "g" | "b" | "w", string[]>,
): string {
  if (!gemColors || !gem.gemId) {
    return "text-base-content";
  }
  if (
    gemColors.r.includes(gem.nameSpec.replace("Vaal ", "")) ||
    gemColors.r.includes(gem.nameSpec + " Support")
  ) {
    return "text-strength";
  }
  if (
    gemColors.g.includes(gem.nameSpec.replace("Vaal ", "")) ||
    gemColors.g.includes(gem.nameSpec + " Support")
  ) {
    return "text-dexterity";
  }
  if (
    gemColors.b.includes(gem.nameSpec.replace("Vaal ", "")) ||
    gemColors.b.includes(gem.nameSpec + " Support")
  ) {
    return "text-intelligence";
  }

  return "text-base-content";
}
