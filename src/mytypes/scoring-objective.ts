import {
  Objective,
  GameVersion,
  Operator,
  ObjectiveType,
  AggregationType,
  ItemField,
} from "@client/api";
import { ScoreObjective } from "./score";

export function availableAggregationTypes(
  objectiveType: ObjectiveType
): AggregationType[] {
  if (objectiveType === ObjectiveType.ITEM) {
    return Object.values(AggregationType);
  }
  return Object.values(AggregationType).filter(
    (type) => type !== AggregationType.EARLIEST_FRESH_ITEM
  );
}

export function operatorToString(operator: Operator): string {
  switch (operator) {
    case Operator.EQ:
      return "=";
    case Operator.NEQ:
      return "≠";
    case Operator.GT:
      return ">";
    case Operator.LT:
      return "<";
    case Operator.IN:
      return "in";
    case Operator.NOT_IN:
      return "not in";
    case Operator.MATCHES:
      return "matches";
    case Operator.CONTAINS:
      return "contains";
    case Operator.CONTAINS_MATCH:
      return "contains match";
    case Operator.LENGTH_EQ:
      return "length =";
    case Operator.LENGTH_GT:
      return "length >";
    case Operator.LENGTH_LT:
      return "length <";
  }
  return "";
}

var anomalousUniques: {
  [gameVersion: string]: Record<string, Record<string, string>>;
} = {
  poe1: {
    "Grand Spectrum": {
      "Elemental Resistances": "RedGrandSpectrum",
      "Minimum Endurance Charges": "GrandSpectrum3_Red",
      "Minimum Frenzy Charges": "GrandSpectrum3_Green",
      "Minimum Power Charges": "GrandSpectrum3_Blue",
      Life: "GrandSpectrum2_red",
      "Critical Strike Chance": "BlueGrandSpectrum",
      "Minion Critical Strike Multiplier": "GrandSpectrum2_blue",
      "Elemental Damage": "GreenGrandSpectrum",
      "Avoid Elemental Ailments": "GrandSpectrum2_Green",
    },
    Impresence: {
      Cold: "ElderCold",
      Fire: "ElderFire",
      Lightning: "ElderLightning",
      Chaos: "ElderChaos",
      Physical: "ElderPhysical",
    },
    "Doryani's Delusion": {
      "Titan Greaves": "DoriyanisRed",
      "Sorcerer Boots": "DoriyanisBlue",
      "Slink Boots": "DoriyanisGreen",
    },
    "Precursor's Emblem": {
      Strength: "CombinedRedRing",
      Dexterity: "CombinedGreenRing",
      Intelligence: "CombinedBlueRing",
      "Strength and Intelligence": "CombinedRedBlueRing",
      "Strength and Dexterity": "CombinedRedGreenRing",
      "Dexterity and Intelligence": "CombinedGreenBlueRing",
      "All Attributes": "CombinedPrismaticRing",
    },
    "Combat Focus": {
      "Cobalt Jewel": "ElementalHitFire",
      "Viridian Jewel": "ElementalHitLightening",
      "Crimson Jewel": "ElementalHitCold",
    },
    "The Beachhead": {
      T5: "HarbingerWhite",
      T10: "HarbingerYellow",
      T15: "HarbingerRed",
    },
  },
  poe2: {
    "Grand Spectrum": {
      Ruby: "GrandSpectrum_Ruby",
      Emerald: "GrandSpectrum_Emerald",
      Sapphire: "GrandSpectrum_Sapphire",
    },
    "Sekhema's Resolve": {
      Cold: "RimeveilSeal",
      Fire: "EmberheartSeal",
      Lightning: "StormforgedSeal",
    },
  },
};
const beasts = [
  "Farric Flame Hellion Alpha",
  "Farric Frost Hellion Alpha",
  "Wild Hellion Alpha",
  "Flame Hellion",
  "Dune Hellion",
  "Ruins Hellion",
  "Mountain Hellion",
  "Mountain Hellion Alpha",
  "Enslaved Hellion",
  "Shackled Hellion",
  "Farric Lynx Alpha",
  "Mountain Lynx",
  "Farrul, First of the Plains",
  "Farric Tiger Alpha",
  "Farric Goatman",
  "Primal Cystcaller",
  "Goatman",
  "Goatman Stomper",
  "Alpine Devil",
  "Hill Devil",
  "Colossus Crusher",
  "Goatman Shaman",
  "Goatman Fire-raiser",
  "Bearded Shaman",
  "Bearded Skycaller",
  "Alpine Shaman",
  "Farric Ape",
  "Blood Ape",
  "Dread Primate",
  "Stygian Ape",
  "Infested Ape",
  "Carnage Ape",
  "Barrow Ape",
  "Farric Chieftain",
  "Blood Chieftain",
  "Carnage Chieftain",
  "Stygian Silverback",
  "Host Chieftain",
  "Farric Wolf Alpha",
  "Arctic Wolf",
  "Snow Wolf",
  "Freezing Wolf",
  "Farric Magma Hound",
  "Primal Rhex Matriarch",
  "Fury Hound",
  "War Hound",
  "Farric Pit Hound",
  "Pitbull Demon",
  "Vicious Hound",
  "Purge Hound",
  "Farric Gargantuan",
  "Wild Bristle Matron",
  "Cave Beast",
  "Enraptured Beast",
  "Bone Cruncher",
  "Hairy Bonecruncher",
  "Shaggy Monstrosity",
  "Thicket Hulk",
  "Skeletal Beast",
  "Corrupted Beast",
  "Armour Cruncher",
  "Forest Beast",
  "Farric Ursa",
  "Plummeting Ursa",
  "Tunnelfiend",
  "Infested Tunnelfiend",
  "Woods Ursa",
  "Infested Ursa",
  "The Black Mórrigan",
  "Farric Goliath",
  "Porcupine Goliath",
  "Chrome-touched Goliath",
  "Chrome-infused Goliath",
  "Farric Taurus",
  "Fighting Bull",
  "Avalanche Rider",
  "Grazing Taurus",
  "Wild Brambleback",
  "Saqawine Rhoa",
  "Rhoa Mare",
  "Tercel Rhoa",
  "Murk Runner",
  "Bone Rhoa",
  "Corrupted Rhoa",
  "Infested Rhoa",
  "Saqawine Retch",
  "Avian Retch",
  "Gluttonous Gull",
  "Saqawine Vulture",
  "Vivid Vulture",
  "Mindless Scavenger",
  "Scavenging Vulture",
  "Rotting Vulture",
  "Infested Vulture",
  "Rooster Fiend",
  "Talon Archer",
  "Feral Fowl",
  "Saqawal, First of the Sky",
  "Saqawine Rhex",
  "Wild Rhex",
  "Maternal Rhex",
  "Adolescent Rhex",
  "Escaped Rhex",
  "Saqawine Cobra",
  "Saqawine Blood Viper",
  "Night Adder",
  "Host Adder",
  "Bramble Cobra",
  "Host Cobra",
  "Acid Slitherer",
  "Glade Mamba",
  "Spine Serpent",
  "Infested Serpent",
  "Barb Serpent",
  "Sand Serpent",
  "Saqawine Chimeral",
  "Plumed Chimeral",
  "Feral Chimeral",
  "Chrome-touched Chimeral",
  "Chrome-infused Chimeral",
  "Fenumal Queen",
  "Carrion Queen",
  "Carrion Minion",
  "Carrion Swarmer",
  "Carrion Burrower",
  "Scum Crawler",
  "Fenumal Scrabbler",
  "Dust Scrabbler",
  "Dirt Scrabbler",
  "Infested Skitterer",
  "Lowlands Hopper",
  "Sand Skitterer",
  "Sand Leaper",
  "Parasite",
  "Ravenous Parasite",
  "Plated Parasite",
  "Spitting Parasite",
  "Vicious Parasite",
  "Fenumal Plagued Arachnid",
  "Fenumal Widow",
  "Lurking Venom",
  "Vaal Recluse",
  "Noxious Tarantula",
  "Leaping Spider",
  "Arakaali's Daughter",
  "Webbed Spider",
  "Virulent Spider",
  "Corrupted Arach",
  "Crypt Weaver",
  "Mutant Arach",
  "Crypt Ambusher",
  "Corrupted Spitter",
  "Cave Skitterer",
  "Spindle Spider",
  "Maligaro's Inspiration",
  "Enraptured Arachnid",
  "Plagued Arachnid",
  "Maligaro's Muse",
  "Ink Spinner",
  "Fenumal Devourer",
  "Devourer",
  "Fenumus, First of the Night",
  "Fenumal Hybrid Arachnid",
  "Vivid Abberarach",
  "Hybrid Arachnid",
  "Scalding Arachnid",
  "Fenumal Scorpion",
  "Black Scorpion",
  "Sulphuric Scorpion",
  "Sand Scorpion",
  "Predatory Scorpion",
  "Craicic Squid",
  "Merveil's Daughter",
  "Merveil's Attendant",
  "Merveil's Chosen",
  "Merveil's Retainer",
  "Singing Siren",
  "Merveil's Blessed",
  "Cursed Spawn",
  "Unstable Larva",
  "Slimy Nemesis",
  "Venomous Spawn",
  "Craicic Watcher",
  "Vivid Watcher",
  "Soulless Watcher",
  "Cavern Drifter",
  "Sewer Drifter",
  "Craicic Vassal",
  "Brine Vassal",
  "Swarthy Mollusc",
  "Craicic Sand Spitter",
  "Gravel Eater",
  "Granite Eater",
  "Rock Spitter",
  "Crustacean Sniper",
  "Sewage Crawler",
  "Toxic Crawler",
  "Craicic Shield Crab",
  "Scrabbling Menace",
  "Cave Crustacean",
  "Invading Crustacean",
  "Infested Crustacean",
  "Shield Crab",
  "Bleached Crustacean",
  "Craicic Savage Crab",
  "Primal Crushclaw",
  "Savage Crab",
  "Infested Crab",
  "Enraptured Crab",
  "Infested Crawler",
  "Bleached Crawler",
  "Craiceann, First of the Deep",
  "Waste Lurcher",
  "Sulphurspawn",
  "Craicic Spider Crab",
  "Craicic Maw",
  "Fetid Maw",
  "Filth Maw",
  "Infested Maw",
  "Craicic Chimeral",
  "Chimeric Croaker",
  "Vaulting Croaker",
  "Chrome-touched Croaker",
  "Chrome-infused Croaker",
];

const classToBaseType: Record<string, string> = {
  StackableCurrency: "Chaos Orb",
  DelveSocketableCurrency: "Potent Alchemical Resonator",
  DelveStackableSocketableCurrency: "Potent Alchemical Resonator",
  GiftBox: "Wrapped Gift",
  "Two Hand Sword": "Banishing Blade",
  Wand: "Accumulator Wand",
  Dagger: "Ambusher",
  "Rune Dagger": "Boot Blade",
  Claw: "Awl",
  "One Hand Axe": "Arming Axe",
  "One Hand Sword": "Anarchic Spiritblade",
  "Thrusting One Hand Sword": "Antique Rapier",
  "One Hand Mace": "Ancestral Club",
  Sceptre: "Abyssal Sceptre",
  Bow: "Assassin Bow",
  Staff: "Battery Staff",
  Warstaff: "Capacity Rod",
  "Two Hand Axe": "Abyssal Axe",
  "Two Hand Mace": "Blunt Force Condenser",
  FishingRod: "Fishing Rod",
  Ring: "Amethyst Ring",
  Amulet: "Agate Amulet",
  Belt: "Chain Belt",
  Shield: "Alder Spiked Shield",
  Helmet: "Ancient Mask",
  "Body Armour": "Arcane Vestment",
  Boots: "Ambush Boots",
  Gloves: "Aetherwind Gloves",
  LifeFlask: "Colossal Life Flask",
  ManaFlask: "Colossal Mana Flask",
  HybridFlask: "Colossal Hybrid Flask",
  UtilityFlask: "Amethyst Flask",
  Quiver: "Artillery Quiver",
  "Active Skill Gem": "Absolution",
  "Support Skill Gem": "Added Chaos Damage Support",
  Jewel: "Cobalt Jewel",
  AbyssJewel: "Ghastly Eye Jewel",
  Map: "DeliriusMap",
  MapFragment: "Abyss Scarab",
  Breachstone: "Chayula's Breachstone",
  VaultKey: "Ancient Reliquary Key",
  InstanceLocalItem: "Agility Contract",
  DivinationCard: "A Chilling Wind",
  Currency: "Mystery Leaguestone",
  IncubatorStackable: "Abyssal Incubator",
  AtlasUpgradeItem: "Ceremonial Voidstone",
  HeistContract: "Contract: Bunker",
  HeistBlueprint: "Blueprint: Bunker",
  HeistEquipmentUtility: "Hooded Cloak",
  HeistEquipmentReward: "Enamel Brooch",
  HeistEquipmentTool: "Azurite Flashpowder",
  HeistEquipmentWeapon: "Aggregator Charm",
  ExpeditionLogbook: "Expedition Logbook",
  SentinelDrone: "Ancient Apex Sentinel",
  Relic: "Candlestick Relic",
  SanctumSpecialRelic: "Sanctified Relic",
  AtlasRelic: "Burial Idol",
  MemoryLine: "Alva's Memory",
  Gold: "Gold",
  ItemisedSanctum: "Forbidden Tome",
  Tincture: "Ashbark Tincture",
  AnimalCharm: "Corvine Charm",
  ItemisedCorpse: "Blasphemer",
  NecropolisPack: "Allflame Ember of Abyss",
  TransfiguredGem: "Lightning Arrow of Electrocution",
};

export const anomalousBaseTypes: {
  [gameVersion: string]: Record<string, string>;
} = {
  poe1: beasts.reduce(
    (acc, beast) => {
      acc[beast] = "Bestiary_Orb";
      return acc;
    },
    {} as Record<string, string>
  ),
};

export function getItemName(
  objective: ScoreObjective | Objective
): string | null {
  if (
    !objective ||
    !objective.objective_type ||
    objective.objective_type !== ObjectiveType.ITEM
  ) {
    return null;
  }
  for (const condition of objective.conditions) {
    if (condition.field === ItemField.NAME) {
      if (condition.operator === Operator.EQ) {
        return condition.value;
      } else if (condition.operator === Operator.IN) {
        return condition.value.split(",")[0];
      }
    } else if (condition.field === ItemField.BASE_TYPE) {
      if (condition.operator === Operator.EQ) {
        return condition.value;
      } else if (condition.operator === Operator.IN) {
        return condition.value.split(",")[0];
      }
    }
  }
  return null;
}

export function getImageLocation(
  objective: ScoreObjective | Objective,
  gameVersion: GameVersion
): string | null {
  if (
    !objective ||
    !objective.objective_type ||
    objective.objective_type !== ObjectiveType.ITEM
  ) {
    return null;
  }
  // has to be this complicated because we want to privilege the name over the base type
  const attributes: { name?: string; base_type?: string; item_class?: string } =
    {
      name: undefined,
      base_type: undefined,
      item_class: undefined,
    };
  for (const condition of objective.conditions) {
    if (condition.field === ItemField.NAME) {
      if (condition.operator === Operator.EQ) {
        attributes.name = condition.value;
      } else if (condition.operator === Operator.IN) {
        attributes.name = condition.value.split(",")[0];
      }
    } else if (condition.field === ItemField.BASE_TYPE) {
      if (condition.operator === Operator.EQ) {
        attributes.base_type = condition.value;
      } else if (condition.operator === Operator.IN) {
        attributes.base_type = condition.value.split(",")[0];
      }
    } else if (condition.field === ItemField.ITEM_CLASS) {
      if (condition.operator === Operator.EQ) {
        attributes.item_class = condition.value;
      } else if (condition.operator === Operator.IN) {
        attributes.item_class = condition.value.split(",")[0];
      }
    }

    if (attributes.name) {
      const anomaly = anomalousUniques[gameVersion][attributes.name];
      if (anomaly) {
        return `/assets/${gameVersion}/items/uniques/${
          anomaly[objective.extra] || Object.values(anomaly)[0]
        }.webp`;
      }
      return `/assets/${gameVersion}/items/uniques/${attributes.name.replaceAll(
        " ",
        "_"
      )}.webp`;
    }
    if (attributes.base_type) {
      if (anomalousBaseTypes[gameVersion][attributes.base_type]) {
        return `/assets/${gameVersion}/items/basetypes/${
          anomalousBaseTypes[gameVersion][attributes.base_type]
        }.webp`;
      }
      return `/assets/${gameVersion}/items/basetypes/${attributes.base_type.replaceAll(
        " ",
        "_"
      )}.webp`;
    }
    if (attributes.item_class) {
      const baseType = classToBaseType[attributes.item_class];
      if (!baseType) {
        return null;
      }
      return `/assets/${gameVersion}/items/basetypes/${baseType.replaceAll(
        " ",
        "_"
      )}.webp`;
    }
  }
  return null;
}

export type Daily = {
  baseObjective: ScoreObjective;
  raceObjective?: ScoreObjective;
};
