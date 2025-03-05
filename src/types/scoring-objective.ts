import {
  Objective,
  GameVersion,
  Operator,
  ObjectiveType,
  AggregationType,
  NumberField,
  ItemField,
} from "../client";
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

export function playerNumberfields(): NumberField[] {
  return [NumberField.PLAYER_LEVEL, NumberField.PLAYER_XP];
}

export function operatorForField(field: ItemField): Operator[] {
  const numberOperators = [
    Operator.EQ,
    Operator.NEQ,
    Operator.GT,
    Operator.LT,
    Operator.IN,
    Operator.NOT_IN,
  ];
  const stringOperators = [
    Operator.EQ,
    Operator.NEQ,
    Operator.IN,
    Operator.NOT_IN,
    Operator.MATCHES,
  ];
  const stringArrayOperators = [Operator.CONTAINS, Operator.CONTAINS_MATCH];

  switch (field) {
    case ItemField.BASE_TYPE:
      return stringOperators;
    case ItemField.NAME:
      return stringOperators;
    case ItemField.TYPE_LINE:
      return stringOperators;
    case ItemField.RARITY:
      return stringOperators;
    case ItemField.FRAME_TYPE:
      return numberOperators;
    case ItemField.TALISMAN_TIER:
      return numberOperators;
    case ItemField.EXPLICIT_MODS:
      return stringArrayOperators;
    case ItemField.IMPLICIT_MODS:
      return stringArrayOperators;
    case ItemField.CRAFTED_MODS:
      return stringArrayOperators;
    case ItemField.FRACTURED_MODS:
      return stringArrayOperators;
    case ItemField.ILVL:
      return numberOperators;
    case ItemField.MAX_LINKS:
      return numberOperators;
    case ItemField.ENCHANT_MODS:
      return stringArrayOperators;
    default:
      return [];
  }
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
  }
  return "";
}

var anomalousUniques: {
  [gameVersion: string]: { [key: string]: { [key: string]: string } };
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
  const attributes: { name?: string; base_type?: string } = {
    name: undefined,
    base_type: undefined,
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
    return `/assets/${gameVersion}/items/basetypes/${attributes.base_type.replaceAll(
      " ",
      "_"
    )}.webp`;
  }
  return null;
}

export type Daily = {
  baseObjective: ScoreObjective;
  raceObjective?: ScoreObjective;
};
