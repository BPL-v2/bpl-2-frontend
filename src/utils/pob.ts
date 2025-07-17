import pako from "pako";

interface PlayerStats {
  averageDamage: number;
  averageBurstDamage: number;
  speed: number;
  preEffectiveCritChance: number;
  critChance: number;
  critMultiplier: number;
  hitChance: number;
  totalDPS: number;
  totalDot: number;
  withBleedDPS: number;
  withIgniteDPS: number;
  poisonDPS: number;
  poisonDamage: number;
  withPoisonDPS: number;
  totalDotDPS: number;
  cullingDPS: number;
  reservationDPS: number;
  combinedDPS: number;
  areaOfEffectRadiusMetres: number;
  manaCost: number;
  manaPercentCost: number;
  manaPerSecondCost: number;
  manaPercentPerSecondCost: number;
  lifeCost: number;
  lifePercentCost: number;
  lifePerSecondCost: number;
  lifePercentPerSecondCost: number;
  esCost: number;
  esPerSecondCost: number;
  esPercentPerSecondCost: number;
  rageCost: number;
  soulCost: number;
  str: number;
  reqStr: number;
  dex: number;
  reqDex: number;
  int: number;
  reqInt: number;
  devotion: number;
  totalEHP: number;
  physicalMaximumHitTaken: number;
  lightningMaximumHitTaken: number;
  fireMaximumHitTaken: number;
  coldMaximumHitTaken: number;
  chaosMaximumHitTaken: number;
  mainHandAccuracy: number;
  life: number;
  specLifeInc: number;
  lifeUnreserved: number;
  lifeRecoverable: number;
  lifeUnreservedPercent: number;
  lifeRegenRecovery: number;
  lifeLeechGainRate: number;
  mana: number;
  specManaInc: number;
  manaUnreserved: number;
  manaUnreservedPercent: number;
  manaRegenRecovery: number;
  manaLeechGainRate: number;
  energyShield: number;
  energyShieldRecoveryCap: number;
  specEnergyShieldInc: number;
  energyShieldRegenRecovery: number;
  energyShieldLeechGainRate: number;
  ward: number;
  rageRegenRecovery: number;
  totalBuildDegen: number;
  totalNetRegen: number;
  netLifeRegen: number;
  netManaRegen: number;
  netEnergyShieldRegen: number;
  evasion: number;
  specEvasionInc: number;
  meleeEvadeChance: number;
  projectileEvadeChance: number;
  armour: number;
  specArmourInc: number;
  physicalDamageReduction: number;
  effectiveBlockChance: number;
  effectiveSpellBlockChance: number;
  attackDodgeChance: number;
  spellDodgeChance: number;
  effectiveSpellSuppressionChance: number;
  fireResist: number;
  fireResistOverCap: number;
  coldResist: number;
  coldResistOverCap: number;
  lightningResist: number;
  lightningResistOverCap: number;
  chaosResist: number;
  chaosResistOverCap: number;
  effectiveMovementSpeedMod: number;
  fullDPS: number;
  fullDotDPS: number;
  powerCharges: number;
  powerChargesMax: number;
  frenzyCharges: number;
  frenzyChargesMax: number;
  enduranceCharges: number;
  enduranceChargesMax: number;
}

interface Gem {
  gemId: string;
  variantId: string;
  enableGlobal1: string;
  nameSpec: string;
  qualityId: string;
  enabled: string;
  enableGlobal2: string;
  quality: string;
  skillId: string;
  count: string;
  level: string;
  skillPart?: number;
}

interface Skill {
  label: string;
  slot: string;
  mainActiveSkillCalcs: string;
  mainActiveSkill: string;
  includeInFullDPS: string;
  enabled: string;
  gems: Gem[];
}

interface SkillSet {
  id: number;
  skills: Skill[];
}

interface Skills {
  activeSkillSet: number;
  sortGemsByDPS: string;
  sortGemsByDPSField: string;
  showSupportGemTypes: string;
  showAltQualityGems: string;
  defaultGemLevel: string;
  defaultGemQuality: string;
  skillSets: SkillSet[];
}

interface Build {
  playerStats: PlayerStats;
  bandit: string;
  level: number;
  mainSocketGroup: number;
  pantheonMajorGod: string;
  pantheonMinorGod: string;
  className: string;
  ascendClassName: string;
}

export interface PathOfBuilding {
  build: Build;
  skills: Skills;
  items: Item[];
}

export enum Rarity {
  Relic,
  Unique,
  Rare,
  Magic,
  Normal,
}

export enum Influence {
  Shaper,
  Elder,
  Crusader,
  Hunter,
  Redeemer,
  Warlord,
  SearingExarch,
  EaterOfWorlds,
  Synthesis,
  Fracture,
}

export interface Mod {
  fractured: boolean;
  crafted: boolean;
  line: string;
  tag?: string;
  variant?: string;
}

export interface Item {
  id: string;
  rarity: Rarity;
  name: string;
  base: string;
  itemLevel: number;
  levelRequirement: number;
  quality: number;
  altQuality?: string;
  armour: number;
  evasion: number;
  energyShield: number;
  influence1?: Influence;
  influence2?: Influence;
  mirrored: boolean;
  split: boolean;
  corrupted: boolean;
  selectedVariant: string;
  implicits: Mod[];
  explicits: Mod[];
  slot: string | null;
}
function setPlayerStat(stats: PlayerStats, stat: string, value: number): void {
  switch (stat) {
    case "AverageDamage":
      stats.averageDamage = value;
      break;
    case "AverageBurstDamage":
      stats.averageBurstDamage = value;
      break;
    case "Speed":
      stats.speed = value;
      break;
    case "PreEffectiveCritChance":
      stats.preEffectiveCritChance = value;
      break;
    case "CritChance":
      stats.critChance = value;
      break;
    case "CritMultiplier":
      stats.critMultiplier = value;
      break;
    case "HitChance":
      stats.hitChance = value;
      break;
    case "TotalDPS":
      stats.totalDPS = value;
      break;
    case "TotalDot":
      stats.totalDot = value;
      break;
    case "WithBleedDPS":
      stats.withBleedDPS = value;
      break;
    case "WithIgniteDPS":
      stats.withIgniteDPS = value;
      break;
    case "PoisonDPS":
      stats.poisonDPS = value;
      break;
    case "PoisonDamage":
      stats.poisonDamage = value;
      break;
    case "WithPoisonDPS":
      stats.withPoisonDPS = value;
      break;
    case "TotalDotDPS":
      stats.totalDotDPS = value;
      break;
    case "CullingDPS":
      stats.cullingDPS = value;
      break;
    case "ReservationDPS":
      stats.reservationDPS = value;
      break;
    case "CombinedDPS":
      stats.combinedDPS = value;
      break;
    case "AreaOfEffectRadiusMetres":
      stats.areaOfEffectRadiusMetres = value;
      break;
    case "ManaCost":
      stats.manaCost = value;
      break;
    case "ManaPercentCost":
      stats.manaPercentCost = value;
      break;
    case "ManaPerSecondCost":
      stats.manaPerSecondCost = value;
      break;
    case "ManaPercentPerSecondCost":
      stats.manaPercentPerSecondCost = value;
      break;
    case "LifeCost":
      stats.lifeCost = value;
      break;
    case "LifePercentCost":
      stats.lifePercentCost = value;
      break;
    case "LifePerSecondCost":
      stats.lifePerSecondCost = value;
      break;
    case "LifePercentPerSecondCost":
      stats.lifePercentPerSecondCost = value;
      break;
    case "ESCost":
      stats.esCost = value;
      break;
    case "ESPerSecondCost":
      stats.esPerSecondCost = value;
      break;
    case "ESPercentPerSecondCost":
      stats.esPercentPerSecondCost = value;
      break;
    case "RageCost":
      stats.rageCost = value;
      break;
    case "SoulCost":
      stats.soulCost = value;
      break;
    case "Str":
      stats.str = value;
      break;
    case "ReqStr":
      stats.reqStr = value;
      break;
    case "Dex":
      stats.dex = value;
      break;
    case "ReqDex":
      stats.reqDex = value;
      break;
    case "Int":
      stats.int = value;
      break;
    case "ReqInt":
      stats.reqInt = value;
      break;
    case "Devotion":
      stats.devotion = value;
      break;
    case "TotalEHP":
      stats.totalEHP = value;
      break;
    case "PhysicalMaximumHitTaken":
      stats.physicalMaximumHitTaken = value;
      break;
    case "LightningMaximumHitTaken":
      stats.lightningMaximumHitTaken = value;
      break;
    case "FireMaximumHitTaken":
      stats.fireMaximumHitTaken = value;
      break;
    case "ColdMaximumHitTaken":
      stats.coldMaximumHitTaken = value;
      break;
    case "ChaosMaximumHitTaken":
      stats.chaosMaximumHitTaken = value;
      break;
    case "MainHandAccuracy":
      stats.mainHandAccuracy = value;
      break;
    case "Life":
      stats.life = value;
      break;
    case "Spec:LifeInc":
      stats.specLifeInc = value;
      break;
    case "LifeUnreserved":
      stats.lifeUnreserved = value;
      break;
    case "LifeRecoverable":
      stats.lifeRecoverable = value;
      break;
    case "LifeUnreservedPercent":
      stats.lifeUnreservedPercent = value;
      break;
    case "LifeRegenRecovery":
      stats.lifeRegenRecovery = value;
      break;
    case "LifeLeechGainRate":
      stats.lifeLeechGainRate = value;
      break;
    case "Mana":
      stats.mana = value;
      break;
    case "Spec:ManaInc":
      stats.specManaInc = value;
      break;
    case "ManaUnreserved":
      stats.manaUnreserved = value;
      break;
    case "ManaUnreservedPercent":
      stats.manaUnreservedPercent = value;
      break;
    case "ManaRegenRecovery":
      stats.manaRegenRecovery = value;
      break;
    case "ManaLeechGainRate":
      stats.manaLeechGainRate = value;
      break;
    case "EnergyShield":
      stats.energyShield = value;
      break;
    case "EnergyShieldRecoveryCap":
      stats.energyShieldRecoveryCap = value;
      break;
    case "Spec:EnergyShieldInc":
      stats.specEnergyShieldInc = value;
      break;
    case "EnergyShieldRegenRecovery":
      stats.energyShieldRegenRecovery = value;
      break;
    case "EnergyShieldLeechGainRate":
      stats.energyShieldLeechGainRate = value;
      break;
    case "Ward":
      stats.ward = value;
      break;
    case "RageRegenRecovery":
      stats.rageRegenRecovery = value;
      break;
    case "TotalBuildDegen":
      stats.totalBuildDegen = value;
      break;
    case "TotalNetRegen":
      stats.totalNetRegen = value;
      break;
    case "NetLifeRegen":
      stats.netLifeRegen = value;
      break;
    case "NetManaRegen":
      stats.netManaRegen = value;
      break;
    case "NetEnergyShieldRegen":
      stats.netEnergyShieldRegen = value;
      break;
    case "Evasion":
      stats.evasion = value;
      break;
    case "Spec:EvasionInc":
      stats.specEvasionInc = value;
      break;
    case "MeleeEvadeChance":
      stats.meleeEvadeChance = value;
      break;
    case "ProjectileEvadeChance":
      stats.projectileEvadeChance = value;
      break;
    case "Armour":
      stats.armour = value;
      break;
    case "Spec:ArmourInc":
      stats.specArmourInc = value;
      break;
    case "PhysicalDamageReduction":
      stats.physicalDamageReduction = value;
      break;
    case "EffectiveBlockChance":
      stats.effectiveBlockChance = value;
      break;
    case "EffectiveSpellBlockChance":
      stats.effectiveSpellBlockChance = value;
      break;
    case "AttackDodgeChance":
      stats.attackDodgeChance = value;
      break;
    case "SpellDodgeChance":
      stats.spellDodgeChance = value;
      break;
    case "EffectiveSpellSuppressionChance":
      stats.effectiveSpellSuppressionChance = value;
      break;
    case "FireResist":
      stats.fireResist = value;
      break;
    case "FireResistOverCap":
      stats.fireResistOverCap = value;
      break;
    case "ColdResist":
      stats.coldResist = value;
      break;
    case "ColdResistOverCap":
      stats.coldResistOverCap = value;
      break;
    case "LightningResist":
      stats.lightningResist = value;
      break;
    case "LightningResistOverCap":
      stats.lightningResistOverCap = value;
      break;
    case "ChaosResist":
      stats.chaosResist = value;
      break;
    case "ChaosResistOverCap":
      stats.chaosResistOverCap = value;
      break;
    case "EffectiveMovementSpeedMod":
      stats.effectiveMovementSpeedMod = value;
      break;
    case "FullDPS":
      stats.fullDPS = value;
      break;
    case "FullDotDPS":
      stats.fullDotDPS = value;
      break;
    case "PowerCharges":
      stats.powerCharges = value;
      break;
    case "PowerChargesMax":
      stats.powerChargesMax = value;
      break;
    case "FrenzyCharges":
      stats.frenzyCharges = value;
      break;
    case "FrenzyChargesMax":
      stats.frenzyChargesMax = value;
      break;
    case "EnduranceCharges":
      stats.enduranceCharges = value;
      break;
    case "EnduranceChargesMax":
      stats.enduranceChargesMax = value;
      break;
  }
}

function inflateZlib(data: Uint8Array): Uint8Array {
  return pako.inflate(data);
}

function pobstringToXml(pob: string): Document {
  const decoded = atob(pob.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  const inflated = inflateZlib(bytes);
  const xmlString = new TextDecoder().decode(inflated);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Failed to parse XML");
  }
  return xmlDoc;
}

export function decodePoBExport(input: string): PathOfBuilding {
  const xmlDoc = pobstringToXml(input);
  const result: PathOfBuilding = {
    build: {
      playerStats: {} as PlayerStats,
      bandit: "",
      level: 0,
      mainSocketGroup: 0,
      pantheonMajorGod: "",
      pantheonMinorGod: "",
      className: "",
      ascendClassName: "",
    },
    skills: {
      activeSkillSet: 0,
      sortGemsByDPS: "",
      sortGemsByDPSField: "",
      showSupportGemTypes: "",
      showAltQualityGems: "",
      defaultGemLevel: "",
      defaultGemQuality: "",
      skillSets: [],
    },
    items: [],
  };
  const build = xmlDoc.getElementsByTagName("Build")[0];
  result.build.bandit = build.getAttribute("bandit") || "";
  result.build.level = parseInt(build.getAttribute("level") || "0");
  result.build.pantheonMajorGod = build.getAttribute("pantheonMajorGod") || "";
  result.build.pantheonMinorGod = build.getAttribute("pantheonMinorGod") || "";
  result.build.className = build.getAttribute("className") || "";
  result.build.ascendClassName = build.getAttribute("ascendClassName") || "";
  result.build.mainSocketGroup = parseInt(
    build.getAttribute("mainSocketGroup") || "0"
  );

  const playerStatElements = xmlDoc.getElementsByTagName("PlayerStat");
  for (const element of playerStatElements) {
    const stat = element.getAttribute("stat");
    const value = element.getAttribute("value");
    if (stat && value) {
      setPlayerStat(result.build.playerStats, stat, parseFloat(value));
    }
  }

  const skillsElement = xmlDoc.getElementsByTagName("Skills")[0];
  if (skillsElement) {
    result.skills.activeSkillSet = parseInt(
      skillsElement.getAttribute("activeSkillSet") || "0"
    );
    result.skills.sortGemsByDPS =
      skillsElement.getAttribute("sortGemsByDPS") || "";
    result.skills.sortGemsByDPSField =
      skillsElement.getAttribute("sortGemsByDPSField") || "";
    result.skills.showSupportGemTypes =
      skillsElement.getAttribute("showSupportGemTypes") || "";
    result.skills.showAltQualityGems =
      skillsElement.getAttribute("showAltQualityGems") || "";
    result.skills.defaultGemLevel =
      skillsElement.getAttribute("defaultGemLevel") || "";
    result.skills.defaultGemQuality =
      skillsElement.getAttribute("defaultGemQuality") || "";

    const skillSetElements = skillsElement.getElementsByTagName("SkillSet");
    for (const skillSetElement of skillSetElements) {
      const skillSet: SkillSet = {
        id: parseInt(skillSetElement.getAttribute("id") || "0"),
        skills: [],
      };

      const skillElements = skillSetElement.getElementsByTagName("Skill");
      for (const skillElement of skillElements) {
        const skill: Skill = {
          label: skillElement.getAttribute("label") || "",
          slot: skillElement.getAttribute("slot") || "",
          mainActiveSkillCalcs:
            skillElement.getAttribute("mainActiveSkillCalcs") || "",
          mainActiveSkill: skillElement.getAttribute("mainActiveSkill") || "",
          includeInFullDPS: skillElement.getAttribute("includeInFullDPS") || "",
          enabled: skillElement.getAttribute("enabled") || "",
          gems: [],
        };

        const gemElements = skillElement.getElementsByTagName("Gem");
        for (const gemElement of gemElements) {
          const gem: Gem = {
            gemId: gemElement.getAttribute("gemId") || "",
            variantId: gemElement.getAttribute("variantId") || "",
            enableGlobal1: gemElement.getAttribute("enableGlobal1") || "",
            nameSpec: gemElement.getAttribute("nameSpec") || "",
            qualityId: gemElement.getAttribute("qualityId") || "",
            enabled: gemElement.getAttribute("enabled") || "",
            enableGlobal2: gemElement.getAttribute("enableGlobal2") || "",
            quality: gemElement.getAttribute("quality") || "",
            skillId: gemElement.getAttribute("skillId") || "",
            count: gemElement.getAttribute("count") || "",
            level: gemElement.getAttribute("level") || "",
          };

          const skillPart = gemElement.getAttribute("skillPart");
          if (skillPart) {
            gem.skillPart = parseInt(skillPart);
          }

          skill.gems.push(gem);
        }

        skillSet.skills.push(skill);
      }

      result.skills.skillSets.push(skillSet);
    }
  }

  // Parse items
  const itemsElement = xmlDoc.getElementsByTagName("Items")[0];
  if (itemsElement) {
    const idToSlot: Record<string, string | null> = {};
    const treeElements = xmlDoc.getElementsByTagName("Tree");
    if (treeElements.length > 0) {
      const tree = treeElements[0];
      const specs = tree.getElementsByTagName("Spec");
      const activeSpec = Number(tree.getAttribute("activeSpec"));
      for (const socket of specs[activeSpec - 1].getElementsByTagName(
        "Socket"
      )) {
        idToSlot[socket.getAttribute("itemId") || ""] = "Socket";
      }
    }

    const itemSets = itemsElement.getElementsByTagName("ItemSet");
    if (itemSets.length > 0) {
      for (const slot of itemSets[0].getElementsByTagName("Slot")) {
        idToSlot[slot.getAttribute("itemId") || ""] = slot.getAttribute("name");
      }
    }
    const items: Item[] = [];
    const itemElements = itemsElement.getElementsByTagName("Item");
    for (const itemElement of itemElements) {
      let text = "";
      for (const node of itemElement.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || "";
        }
      }
      items.push(
        parseItem(
          text.trim(),
          idToSlot[itemElement.getAttribute("id") || ""],
          itemElement.getAttribute("id")!
        )
      );
    }
    result.items = items;
  }

  return result;
}

function parseRarity(s: string): Rarity {
  switch (s) {
    case "NORMAL":
      return Rarity.Normal;
    case "MAGIC":
      return Rarity.Magic;
    case "RARE":
      return Rarity.Rare;
    case "UNIQUE":
      return Rarity.Unique;
    case "RELIC":
      return Rarity.Relic;
    default:
      throw new Error(`invalid rarity: ${s}`);
  }
}

function parseInfluence(s: string): Influence | undefined {
  switch (s) {
    case "Shaper Item":
      return Influence.Shaper;
    case "Elder Item":
      return Influence.Elder;
    case "Crusader Item":
      return Influence.Crusader;
    case "Hunter Item":
      return Influence.Hunter;
    case "Redeemer Item":
      return Influence.Redeemer;
    case "Warlord Item":
      return Influence.Warlord;
    case "Searing Exarch Item":
      return Influence.SearingExarch;
    case "Eater of Worlds Item":
      return Influence.EaterOfWorlds;
    default:
      if (s.startsWith("Synthesised")) return Influence.Synthesis;
      return undefined;
  }
}

function catalystToAltQuality(s: string): string {
  switch (s) {
    case "Abrasive":
      return "Attack Modifiers";
    case "Accelerating":
      return "Speed Modifiers";
    case "Fertile":
      return "Life and Mana Modifiers";
    case "Imbued":
      return "Caster Modifiers";
    case "Intrinsic":
      return "Attribute Modifiers";
    case "Noxious":
      return "Physical and Chaos Damage Modifiers";
    case "Prismatic":
      return "Resistance Modifiers";
    case "Tempering":
      return "Defense Modifiers";
    case "Turbulent":
      return "Elemental Modifiers";
    case "Unstable":
      return "Critical Modifiers";
    default:
      return s;
  }
}

function fixupItemName(name: string): string {
  const idx = name.lastIndexOf("- ");
  if (idx !== -1) name = name.slice(idx + 2);
  const bracket = name.indexOf("[");
  if (bracket !== -1) name = name.slice(0, bracket);
  return name.replace("Superior", "").trim();
}

function parseAltQuality(
  cmd: string,
  arg: string
): { alt: string; quality: number } | undefined {
  if (!cmd.startsWith("Quality (") || !cmd.endsWith(")")) return undefined;
  const alt = cmd.slice(8, -1);
  const val = arg.replace(/^\+/, "").replace(/%$/, "");
  const quality = parseInt(val, 10);
  if (isNaN(quality)) return undefined;
  return { alt, quality };
}

function isModLine(line: string): boolean {
  const fields = line.trim().split(/\s+/);
  return fields.length > 0 && !fields[0].endsWith(":");
}

function parseMod(modLine: string): Mod {
  let fractured = false,
    crafted = false,
    variant: string | undefined,
    tag: string | undefined;
  let line = modLine;
  while (line.startsWith("{")) {
    const end = line.indexOf("}");
    if (end === -1) break;
    const attr = line.slice(1, end);
    line = line.slice(end + 1);
    const [key, value] = attr.split(":", 2);
    if (value !== undefined) {
      switch (key) {
        case "variant":
          variant = value;
          break;
        case "fractured":
          fractured = true;
          break;
        case "crafted":
          crafted = true;
          break;
        case "tags":
        case "custom":
        case "range":
          break;
        default:
          tag = key;
          break;
      }
    } else {
      switch (key) {
        case "fractured":
          fractured = true;
          break;
        case "crafted":
          crafted = true;
          break;
        default:
          tag = key;
          break;
      }
    }
  }
  return { fractured, crafted, line: line.trim(), tag, variant };
}

function extractMagicBase(base: string, numMods: number): string {
  if (numMods === 0) return base;
  if (base.startsWith("Synthesised ")) base = base.slice("Synthesised ".length);
  let end = base.indexOf(" of");
  const hasSuffix = end !== -1;
  if (!hasSuffix) end = base.length;
  base = base.slice(0, end);
  if (hasSuffix && numMods === 1) return base;
  else if (mayBeFullBase(base)) return base;
  else {
    const idx = base.indexOf(" ");
    return idx !== -1 ? base.slice(idx + 1) : base;
  }
}

function mayBeFullBase(name: string): boolean {
  let words = 2;
  if (
    name.endsWith("Shield") ||
    name.endsWith("Cluster Jewel") ||
    name.endsWith("Abyss Jewel")
  )
    words = 3;
  return name.trim().split(/\s+/).length === words;
}

export function parseItem(item: string, slot: string | null, id: string): Item {
  const lines = item.split("\n");
  if (!lines[0].startsWith("Rarity: ")) throw new Error("expected rarity");
  const rarity = parseRarity(lines[0].slice(8));
  let idx = 1;
  let name = "",
    base = "";
  if ([Rarity.Rare, Rarity.Unique, Rarity.Relic].includes(rarity)) {
    name = lines[idx++] || "";
  }
  base = lines[idx++] || "";
  if ([Rarity.Normal, Rarity.Magic].includes(rarity)) name = base;
  base = fixupItemName(base);

  let itemLevel = 0,
    levelRequirement = 0,
    quality = 0,
    altQuality: string | undefined = undefined;
  let armour = 0,
    evasion = 0,
    energyShield = 0;
  let influence1: Influence | undefined, influence2: Influence | undefined;
  let selectedVariant = "";
  const implicits: Mod[] = [];

  while (idx < lines.length) {
    const line = lines[idx];
    if (!line) {
      idx++;
      continue;
    }
    const colon = line.indexOf(": ");
    if (colon !== -1) {
      const cmd = line.slice(0, colon),
        arg = line.slice(colon + 2);
      switch (cmd) {
        case "Item Level":
          itemLevel = parseInt(arg) || itemLevel;
          break;
        case "LevelReq":
          levelRequirement = parseInt(arg) || levelRequirement;
          break;
        case "Quality":
          quality = parseInt(arg) || quality;
          break;
        case "Catalyst":
          altQuality = catalystToAltQuality(arg);
          break;
        case "CatalystQuality":
          quality = parseInt(arg) || quality;
          break;
        case "Armour":
          armour = parseInt(arg) || armour;
          break;
        case "Evasion":
          evasion = parseInt(arg) || evasion;
          break;
        case "Energy Shield":
          energyShield = parseInt(arg) || energyShield;
          break;
        case "Implicits": {
          const num = parseInt(arg) || 0;
          for (let i = 0; i < num; i++) {
            implicits.push(parseMod(lines[idx + 1 + i]));
          }
          idx += num;
          break;
        }
        case "Selected Variant":
          selectedVariant = arg;
          break;
        default: {
          const altQ = parseAltQuality(cmd, arg);
          if (altQ) {
            altQuality = altQ.alt;
            quality = altQ.quality;
          }
        }
      }
      idx++;
      continue;
    }
    const infl = parseInfluence(line);
    if (infl !== undefined) {
      if (influence1 === undefined) influence1 = infl;
      else if (influence2 === undefined) influence2 = infl;
      idx++;
      continue;
    }
    if (line === base) {
      idx++;
      continue;
    }
    break;
  }

  // Parse status lines at the end
  let corrupted = false,
    mirrored = false,
    split = false;
  let modsEnd = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i] === "Corrupted") corrupted = true;
    else if (lines[i] === "Mirrored") mirrored = true;
    else if (lines[i] === "Split") split = true;
    else {
      modsEnd = i + 1;
      break;
    }
  }

  // Parse explicits
  let firstExplicitMod = -1;
  for (let i = idx; i < modsEnd; i++) {
    if (isModLine(lines[i])) {
      firstExplicitMod = i;
      break;
    }
  }
  const explicits: Mod[] = [];
  if (firstExplicitMod !== -1) {
    for (let i = firstExplicitMod; i < modsEnd; i++) {
      explicits.push(parseMod(lines[i]));
    }
  }

  // Magic base fix
  if (rarity === Rarity.Magic) {
    base = extractMagicBase(base, explicits.length);
  }

  // Fractured influence
  if (influence1 === undefined) {
    for (const mod of explicits) {
      if (mod.tag === "fractured") {
        influence1 = Influence.Fracture;
        break;
      }
    }
  }
  if (influence2 === undefined && influence1 !== undefined) {
    influence2 = influence1;
  }

  return {
    rarity,
    name,
    base,
    itemLevel,
    levelRequirement,
    quality,
    altQuality,
    armour,
    evasion,
    energyShield,
    influence1,
    influence2,
    mirrored,
    split,
    corrupted,
    selectedVariant,
    implicits,
    explicits,
    slot,
    id,
  };
}
