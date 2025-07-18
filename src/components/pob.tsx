import { useFile } from "@client/query";
import { decodePoBExport, Item, Rarity } from "@utils/pob";
import { useMemo, useState } from "react";
import { AscendancyPortrait } from "./ascendancy-portrait";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

function getLink(item: Item) {
  let link = "/assets/poe1/items/";
  if (item.rarity === Rarity.Unique) {
    link += "uniques/" + item.name.replaceAll(" ", "_") + ".webp";
  } else {
    link +=
      "basetypes/" + item.base.split(" (")[0].replaceAll(" ", "_") + ".webp";
  }
  return link;
}

type Probs = {
  pobString: string;
};

function ItemWindow({ item }: { item?: Item }) {
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
      className={`absolute left-full x z-10 x items-center justify-center pointer-events-none border bg-black/[0.9] flex flex-col gap w-128 text-center ${borderColor}`}
    >
      <div
        className={`flex flex-col gap-1 text-xl font-bold p-2 border w-full ${headerColor} ${borderColor}`}
      >
        <p>{item.name}</p>
        <p>{item.name.includes(item.base) ? "" : item.base}</p>
      </div>
      {(item.quality > 0 ||
        item.armour > 0 ||
        item.evasion > 0 ||
        item.energyShield > 0) && (
        <div className={`flex flex-col gap-1 p-2 border w-full ${borderColor}`}>
          {item.quality > 0 && (
            <div>
              <span className="text-base-content/70">
                Quality{item.altQuality ? ` (${item.altQuality})` : ""}:{" "}
              </span>
              <span className="text-magic">+{item.quality}% </span>
            </div>
          )}{" "}
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
        <div className={`flex flex-col gap-1 border p-2 w-full ${borderColor}`}>
          {item.implicits.map((implicit) => (
            <span className={implicit.crafted ? "text-crafted" : "text-magic"}>
              {implicit.line}
            </span>
          ))}
        </div>
      )}
      {item.explicits.length > 0 && (
        <div className={`flex flex-col gap-1 border p-2 w-full ${borderColor}`}>
          {item.explicits.map((explicit) => (
            <span
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
  selection?: Item;
  selectionSetter: (item?: Item) => void;
};

function ItemDisplay({
  item,
  slot,
  selection,
  selectionSetter,
}: ItemDisplayProps) {
  if (!item && !slot) return null;
  if (!slot) {
    slot = item?.slot || "Unknown";
  }
  if (item) {
    return (
      <div
        key={"item-" + item.id}
        className={`item bg-base-200 relative ${slot.replaceAll(" ", "").toLowerCase()} flex justify-center items-center`}
        onMouseEnter={() => selectionSetter(item)}
        onMouseLeave={() => selectionSetter(undefined)}
      >
        <img
          className="max-w-full max-h-full object-contain"
          src={getLink(item)}
          alt={item?.name}
          loading="lazy"
        />
        {selection?.id === item.id && <ItemWindow item={selection} />}
      </div>
    );
  }
  return (
    <div
      key={"item-" + slot}
      className={`item bg-base-200 ${slot.replaceAll(" ", "").toLowerCase()}`}
    ></div>
  );
}

export function PoB({ pobString }: Probs) {
  const { data: gemColors } = useFile<Record<"r" | "g" | "b" | "w", string[]>>(
    "/assets/poe1/items/gem_colors.json"
  );
  const pob = useMemo(() => decodePoBExport(pobString), [pobString]);
  const [selectedItem, setSelectedItem] = useState<Item>();
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
  const flaskSlots = ["Flask 1", "Flask 2", "Flask 3", "Flask 4", "Flask 5"];
  let jewels: Item[] = [];
  const equipment: Record<string, Item | undefined> = equipmentSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>
  );
  const flasks: Record<string, Item | undefined> = flaskSlots.reduce(
    (acc, slot) => {
      acc[slot] = undefined;
      return acc;
    },
    {} as Record<string, Item | undefined>
  );
  for (const item of pob.items) {
    if (!item.slot) continue;
    if (item.slot.includes("Abyssal") || item.slot.includes("Socket")) {
      jewels.push(item);
    } else if (equipmentSlots.includes(item.slot)) {
      equipment[item.slot] = item;
    } else if (flaskSlots.includes(item.slot)) {
      flasks[item.slot] = item;
      console.log("flask", item.slot, item);
    }
  }

  return (
    <>
      <div className="m-4 flex flex-col xl:flex-row gap-4 text-left">
        <div className="select-none p-8 bg-base-300 rounded-box">
          <div className="inventory  self-center">
            {Object.entries(equipment).map(([slot, item]) => (
              <ItemDisplay
                key={slot}
                item={item}
                slot={slot}
                selection={selectedItem}
                selectionSetter={setSelectedItem}
              />
            ))}
            <div className="flasks">
              {Object.entries(flasks).map(([slot, item]) => (
                <ItemDisplay
                  key={slot}
                  item={item}
                  slot={slot}
                  selection={selectedItem}
                  selectionSetter={setSelectedItem}
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
                  selection={selectedItem}
                  selectionSetter={setSelectedItem}
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex-auto flex flex-col gap-2 bg-base-300 p-8 rounded-box">
            <div className="flex justify-between items-center">
              <h1 className="flex items-center text-xl mb-1 gap-4">
                <AscendancyPortrait
                  character_class={
                    pob.build.ascendClassName || pob.build.className
                  }
                  className="w-14 h-14 rounded-full"
                />
                <span>
                  Level {pob.build.level}{" "}
                  {
                    pob.skills.skillSets[0].skills[
                      pob.build.mainSocketGroup - 1
                    ]?.gems.find((gem) => !gem.variantId.includes("Support"))
                      ?.nameSpec
                  }{" "}
                  {pob.build.ascendClassName || pob.build.className}
                </span>
              </h1>
              <div
                className="tooltip tooltip-primary"
                data-tip="Copy PoB to clipboard"
              >
                <ClipboardDocumentListIcon
                  className="h-8 w-8 cursor-pointer hover:text-primary select-none"
                  onClick={() => {
                    navigator.clipboard.writeText(pobString);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-left">
              <div>
                Life:{" "}
                <span className="text-rose-500">
                  {pob.build.playerStats.life.toLocaleString()}
                </span>
              </div>
              {pob.build.playerStats.energyShield > 0 && (
                <div>
                  ES:{" "}
                  <span className="text-cyan-200">
                    {pob.build.playerStats.energyShield.toLocaleString()}
                  </span>
                </div>
              )}
              {pob.build.playerStats.mana > 0 && (
                <div>
                  Mana:{" "}
                  <span className="text-blue-400">
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
                  {Math.round(pob.build.playerStats.totalEHP).toLocaleString()}
                </span>
                {showEhpTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 pointer-events-none w-60">
                    <div className="bg-black/[0.9] py-2 px-4 text-sm whitespace-pre-line rounded-box shadow-lg">
                      <div>
                        <span>Physical Max Hit: </span>
                        <span className="text-white">
                          {pob.build.playerStats.physicalMaximumHitTaken.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>Fire Max Hit: </span>
                        <span className="text-orange-400">
                          {pob.build.playerStats.fireMaximumHitTaken.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>Cold Max Hit: </span>
                        <span className="text-cyan-200">
                          {pob.build.playerStats.coldMaximumHitTaken.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>Lightning Max Hit: </span>
                        <span className="text-yellow-300">
                          {pob.build.playerStats.lightningMaximumHitTaken.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>Chaos Max Hit: </span>
                        <span className="text-fuchsia-500">
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
                  <span className="text-white">
                    <span title="Attack Block">
                      {" "}
                      {Math.round(pob.build.playerStats.effectiveBlockChance)}%
                    </span>
                    /
                    <span title="Spell Block">
                      {" "}
                      {Math.round(
                        pob.build.playerStats.effectiveSpellBlockChance
                      )}
                      %
                    </span>
                  </span>
                </div>
              )}
              {pob.build.playerStats.effectiveSpellSuppressionChance > 25 && (
                <div>
                  Suppression:{" "}
                  <span className="dark:text-white">
                    {Math.round(
                      pob.build.playerStats.effectiveSpellSuppressionChance
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-row gap-2  justify-left">
              <div>
                Resistances:{" "}
                <span className="text-orange-400">
                  {pob.build.playerStats.fireResist.toLocaleString()}%
                </span>
                /
                <span className="text-blue-400">
                  {pob.build.playerStats.coldResist.toLocaleString()}%
                </span>
                /
                <span className="text-yellow-300">
                  {pob.build.playerStats.lightningResist.toLocaleString()}%
                </span>
                /
                <span className="text-fuchsia-500">
                  {pob.build.playerStats.chaosResist.toLocaleString()}%
                </span>
              </div>
              {pob.build.playerStats.armour > 0 &&
                pob.build.playerStats.physicalDamageReduction > 5 && (
                  <div>
                    Armour:{" "}
                    <span className="dark:text-white">
                      {pob.build.playerStats.armour.toLocaleString()}
                    </span>
                  </div>
                )}
              {pob.build.playerStats.meleeEvadeChance > 5 && (
                <div>
                  Evasion:{" "}
                  <span className="dark:text-white">
                    {pob.build.playerStats.evasion.toLocaleString()}
                  </span>
                </div>
              )}
              {pob.build.playerStats.ward > 200 && (
                <div>
                  Ward:{" "}
                  <span className="dark:text-white">
                    {pob.build.playerStats.ward.toLocaleString()}
                  </span>
                </div>
              )}{" "}
            </div>
            <div className="flex flex-row gap-2">
              <div>
                DPS:{" "}
                <span className="dark:text-white">
                  {Math.round(pob.build.playerStats.fullDPS).toLocaleString()}
                </span>
              </div>
              <div>
                Speed:{" "}
                <span className="dark:text-white">
                  {pob.build.playerStats.speed?.toFixed(2)}
                </span>
              </div>
              {pob.build.playerStats.critMultiplier > 1.6 && (
                <>
                  <div>
                    Crit Chance:{" "}
                    <span className="dark:text-white">
                      {pob.build.playerStats.critChance
                        ?.toFixed(2)
                        .toLocaleString()}
                      %
                    </span>
                  </div>
                  <div>
                    Crit Multi:{" "}
                    <span className="dark:text-white">
                      {pob.build.playerStats.critMultiplier?.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {pob.build.playerStats.effectiveMovementSpeedMod > 2 && (
                <div>
                  Movement Speed:{" "}
                  <span className="dark:text-white">
                    {Math.round(
                      pob.build.playerStats.effectiveMovementSpeedMod * 100
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="columns-2 gap-2 bg-base-300 p-8 rounded-box text-sm h-full">
            {pob.skills.skillSets[0].skills
              .filter((skill) => equipmentSlots.includes(skill.slot))
              .sort((a, b) => b.gems.length - a.gems.length)
              .map((skill, skillId) => (
                <div
                  className="break-inside-avoid mt-2 first:mt-0 bg-base-200 px-3 py-2.5 rounded-xl flex flex-col"
                  key={`skill-${skillId}`}
                >
                  {skill.gems.map((gem, gemId) => {
                    let text = "text-white";
                    let tooltip = "tooltip-white";
                    if (gemColors && gem.gemId) {
                      if (
                        gemColors.r.includes(
                          gem.nameSpec.replace("Vaal ", "")
                        ) ||
                        gemColors.r.includes(gem.nameSpec + " Support")
                      ) {
                        text = "text-rose-500";
                        tooltip = "tooltip-rose";
                      } else if (
                        gemColors.g.includes(
                          gem.nameSpec.replace("Vaal ", "")
                        ) ||
                        gemColors.g.includes(gem.nameSpec + " Support")
                      ) {
                        text = "text-lime-400";
                        tooltip = "tooltip-lime";
                      } else if (
                        gemColors.b.includes(
                          gem.nameSpec.replace("Vaal ", "")
                        ) ||
                        gemColors.b.includes(gem.nameSpec + " Support")
                      ) {
                        text = "text-blue-400";
                        tooltip = "tooltip-blue";
                      }
                    }
                    let position = "";
                    if (gem.skillId.includes("Support")) {
                      position =
                        gemId === skill.gems.length - 1
                          ? "gem-last"
                          : "gem-middle";
                    } else {
                      if (skillId === 0) {
                        text += " font-bold";
                      }
                    }
                    return (
                      <div
                        className={`tooltip tooltip-left ${tooltip}`}
                        data-tip={`${gem.level} / ${gem.quality}%`}
                        key={gemId}
                      >
                        <div
                          className={`truncate ${position} ${text}`}
                          key={"gem-" + skillId + "-" + gemId}
                          data-tip={`${gem.level} / ${gem.quality}%`}
                        >
                          {gem.nameSpec}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
