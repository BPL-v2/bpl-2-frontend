import { useFile } from "@client/query";
import { InventoryIcon } from "@icons/inventory-icons";
import { Gem, PathOfBuilding, Skill } from "@utils/pob";
import { twMerge } from "tailwind-merge";

export function CharacterSkills({ pob }: { pob: PathOfBuilding }) {
  const { data: gemColors } = useFile<Record<"r" | "g" | "b" | "w", string[]>>(
    "/assets/poe1/items/gem_colors.json",
  );
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
  return (
    <div className="h-full columns-2 gap-2 rounded-box bg-base-300 p-4 text-sm md:p-8">
      {equipmentSlots
        .sort((slotA, slotB) => {
          const mainGroup =
            pob.skills.skillSets[0].skills[pob.build.mainSocketGroup - 1];
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
              <InventoryIcon slot={slot} className="absolute top-2 right-2" />
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
