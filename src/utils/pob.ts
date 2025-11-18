// Portions of this file are derived from pasteofexile (https://github.com/Dav1dde/pasteofexile)
// Licensed under GNU AGPL v3.0: https://www.gnu.org/licenses/agpl-3.0.html
// Copyright (c) Dav1dde and contributors
import pako from "pako";

export interface PlayerStats {
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

export interface Gem {
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

export interface Skill {
  label: string;
  slot: string;
  mainActiveSkillCalcs: string;
  mainActiveSkill: string;
  includeInFullDPS: string;
  enabled: string;
  gems: Gem[];
}

export interface SkillSet {
  id: number;
  skills: Skill[];
}

export interface Skills {
  activeSkillSet: number;
  sortGemsByDPS: string;
  sortGemsByDPSField: string;
  showSupportGemTypes: string;
  showAltQualityGems: string;
  defaultGemLevel: string;
  defaultGemQuality: string;
  skillSets: SkillSet[];
}

export interface Build {
  playerStats: PlayerStats;
  bandit: string;
  level: number;
  mainSocketGroup: number;
  pantheonMajorGod: string;
  pantheonMinorGod: string;
  className: string;
  ascendClassName: string;
}

export interface Spec {
  masteryEffects: Record<number, number>;
  nodes: Set<number>;
  treeVersion: string;
}

export interface PathOfBuilding {
  export: string;
  build: Build;
  skills: Skills;
  items: Item[];
  spec: Spec;
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
  mutated: boolean;
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
  mutatedMods: Mod[];
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

function pobstringToXml(pob: string): Document {
  const decoded = atob(pob.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  const xmlString = new TextDecoder().decode(pako.inflate(bytes));
  console.log(xmlString);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Failed to parse XML");
  }
  return xmlDoc;
}

export function decodePoBExport(input?: string): PathOfBuilding {
  input =
    "eNrtfVtz3DbS6HPmV7BUlfNi2SKuBHzs_UpXS7Fky7rE8feSAklQQ5tDyiRHspLa_34aIGdIjsjR6Jbd7Nk8OCOi0Q00uhvdjdub__kxSZwrnRdxlr5dQ6_cNUenQRbG6cXbtfOzvZdi7X_-MXpzrMrxx2hrGiem5B-jn97Y306ir3QC9VyoV6r8Qpe_znCR3-HbpUrLsc7SI_U1y99l4du1s7HeyuNUvwc8a46v0jAu367t5moS52tOkKii-KAmGgD15DJR8E0VgU7D7aZkP9Z5djkG1FBhrHIVlDo_NC3ZnJbZURYCTKSSQq85ExWnp1nwTZfv8mx6-XYNrzlXsb6ugM5OdndbbYzTuo1fphfTZA16-dOb40Td6Py0VKVTwD9v1zaBWepC76gJ_AvIVDIFTBJ7HiOvqPRc4kq2trG08tY0L8qHYTi91DqcV8KvpBCM40Hw41zvRpEOyvhKb-dxuQ1cCxqiHnrFhRiq_KAKR9OkjC8TGKJ5JfpK0qEq-7dIGFkaAD7LSpXsHJ82_fc8zKl8RZBLPZcvr5eV83qDFD7H5XgrARY_gMrBRRqXul2Rush9RTzkSiwx85YRvV0ZqHLOJPAbMU7YssrHWVxk6SMY84BGH8VWDdo0XcwY0MSEu0jgQSGZJgnofrvm4HCc6ELnV6qMu70bhN_OJj7Yls7oUeFi7IpXEnlMoMH-bOZafYwqZTlRYTwtjnSZ66Kta4O8UKnazopGvpi7FPZY52DSyk4V944KpzrIwAq2qyCG0SvkCYKGDUCLXD-SQbqHcaRXh7xXl-oK923Nw_qxe7oq3L0RP6xBJ6A3q0GeZtNkRciyMbcI4WF9-t6G9AbFZkf_aOk1X4KvDYnYIMKDtOmF9MQShG1ILMlwC68yYxfu5o01crv7x3NITgSYOIwEwpLSQQrH45siDlRypH7Ek-kEZqoz9U03BBH3XDQsrxfjMgU7N1SbEVcMGqO9ONcPqridJeHDKo5VVgzVjNNo2L7E6T44cZtBMAVH7KYxu0TQZcrcsHGJqxO8NqAHabCagThPczthtDwktAz-BLTWeGR-oler0BCoVX8Vr6WidKHTmtzNap051DoYvwP2nqiy1Tz0SjK63N63GoUEW8peA95mL-F0GeYeBntC8NWqLLLM815RDHOyZOBnELEMST_7PIlfLaXdz0KMJHuFuAT1XTZz7qY6v7g5Hcc6aYkTpmKlGrPGbqvL1Srb4WhjaA8LRavRvJeQtasOcIoL8opxECPqLgkyPqs8XG3aWw3qvv24UkV7IhBkeMKquFxVaDMYD84CRxrCAagR6oU4hcrhoCv7akKu5J71NvNJNs1XmOxNJyrglUzjbCKrIs4THU6DzsyJBtk1jx23EgiiFzvC7qwGLU2SvrqDbd0sSxV828nCC71qFUvkXjW67TudXl6CjTIisSoCMz9DbBK3XLNhX6oB_ggC3TYIw1Jn5vGVCTTAiwSGrercP1mZykKNe_TFuBYLZF5ydwXwRRp3D-gR2IwJTDI2TXKUtTMlAg1ObXsQkq4UX1rAbrg8rHXZNbR-bJJiTRBJV4EGN-zuCnu5Tv-4WcTvrgTeJkCGp4cQPDpQh5X7sFijrx9n8QQMalHsqFI5Ye3D_6ryWKUlNt6XU2iVB-NDGP49lSQ-WIO3a-2v5q-Fimjmtr3ZsGlJ8-tgcpnlpaN_mP8dq7y8mSUFLaD9AniKMk5tfgFMT5KsOafj7HozvDK9OMuypJhnEtXlpU7DDo6zXGtHzQxJYBph-2j-cCaqKGH6qiQT0PyJBKbuOoEYif9z_U9KJV5nmLsU_vCoEOscY4bhD0QEx-tYuuYPRqhYpwhJ-M0JY3KdU06rEoGhCDPqGnQCgNY5waL6y3W9dSZdTv_ZyZ8ehDYDmmbQcdB1AmSRKzhax57w5Dp2pfDWCeeEroOXJOBfjzMOeKXH16GRnlgnhCB3HQuKoZRxhqAX4EcZ2tAe8OegXxhzBJhtR6iHAYbCH946RxRJ-I05Wa9aDA21VaG5GFOPrGPwy1woZIiuVzxCEpN1yyFmegSc8RBeJ9iDZlQ85eBDEuAfcdclxtAjaA6hDNpBKYYKlEA7gGtEQptcV5oeQk-AHCCCGBARQASogBaDXnEYIWGRUsBFJTRH2n5ajnOXSOCCxz3oFSMI-CUZNlxgLl6X1DUsRYitEwb_AxAuAAHwEdoJ6JlB5rJ1z3TTeKLQDpdwO958nbiy6o-RB8Y8F9AKatnKqRkGztYBNzQGSRAH6KUEziFEGQNICWgwCBgQEjCClLvAPwRd4OuIAxeg3wLoYe5RQ9slxBIBUpzB-MK_AlASD5CZ32bswJWypRJ6D12BEfeQaYiRRCwlcIgBdZAN4CsMB0XQNIiujbRw7MGIu9hAesiOuJFK7FHTQuAusAUEzQy2Z9pAmSCGu2agYXTNWCFgABFSQqcZttIuXApDb_AjCcIK7HW5ER1ODC0K2JDnAWOM6FBLxaiPYRVjggODCa36AkQ4BsQc5ME1SgWiwExfjKkxuRyV32x2FQeBcSpB5VsrHNirlyxMObPa_9Ob85ND--OncVleFq83Nq6vr19dqnKcRfoHOIWvgmyycQmVwG68LL7FSfLSoN3YhP-2Ls6n4Y8_Av9jePKSCvWr3iq2j9Psasq39yfi4H93jg-Pf_eFEuMvn79-mUx_-Tj-_vL3PDt9Kd_9kFtyGv528zn5dPXl4OTrUX62f76jvqSfPkXif_c_bY0_b7Jsd-said_wZfT-Kr86Kt8dn-RfPx2le_tbRbL7_jjfEvKXXf6Sn_3i7e5NJvsf9uKzzV_ox4Nr75fry-uvWz9OxJdfgy_HP_b34j_SrTw_TsPDE3lU0LF_eCjOi70gF1--uzvbxeSYfDx-ORm75_FkB3tf37sftr4FV-P98DTfv_ke0Q-u_vXg8GyP4w_f33nTffVDo61D_v733ShnHzajI_L-y_kfpbj840QWu99VsVl-8fX1l5NzfRW9f_8Vf_2-_ePH2Tf8Mvo-vfrxDbnZ0ebn882Dzb3J5ufNzYOLze9bW5u77z59-ry1dbT15WLv-_an8vOH2CdHh67_x2_XJ1-Pj4r98y3vZDfcvIz_OD05vtl-uRtNpofT_d2t4Jxtvn1rB3ZjNrJvqiWlohrm-i9rVY0cWO1bc-JST6zY1P7-bUBjLBo4jIbgrEFuAeIhQGuzW4DeEKCxPq0WiiE4q4IthHQI0BjfFtwgQjsDtADdwa4YK98CJEOAdjZpAfJB0sbAtABrRxeGtT2ab4zPmccwP9ZYZn87IWj8yTTVF7mKSieLnBMdmaVHG0nFgfUg8nID75h_T41aH8DHYqbpxcZmCZbC-AzFhsHzzuABd9pAea8uzWpow3aYOddq16LyIA5M6NamcH5gPxUbB-k7NdEbvwJB-Nui3q5RH1ekt95Z9FWHfjLhiAM-2yQrSgc5TbBaFduWFw64cHHqvEBOCQ5bURU1oIWzl-Xfqq-H8QR4GjplBtgGGFSxcmPGyztZW46181nll49mLEJdzto56Lk4uzWNosLJUucmmxrH0zCauD87RWKc-wpmR_sDUJF1GO_i6YwzfRxt_rTCC4INjqj1ig1zzI8PWVmVmY-zP97UQ16Ao_xOT4qtG4hv9kxWaGFBrXZ1DfSpLitnvV3n7VqZT7XxziM1Tcz3T1OVxMbzdttfD6tNA2mWT-bZdUAFnrcJxSuMZzeXxkXdPDysSjaTskZmyM3c8MrdrhvkxOHMBa8_2uX_zabV2yoJCtvuOA2SKYhEWod-0Jo4MVsfTC44nHUEBs6kt7S6hOHCa4vo5tR-egONqiu_SzJfJXiGot4gAYbOuagMz5EuVQjRz8YBWKJiw3Rno-n3npWCKgtigicb35hqNUi7HEIy6z4MF3-f8d_Qr_8w0DvVWKx12oxmbV7gQpBN02q0U1CHKtKp6DgzQhsrskEu54LpDPyqUpJVENnlQaeg6Xvn87P1uSLj1HTmk4dpxd0yh-8nc1tZeOPM8oG3xA4_udjZpKAOZ6sHi1J3kBZgp1Q11y3KXKfw2bjfprLx9N0vp7nJbbWmuD4-9MMtMqQf6tk4MyfntOk9OY9OVZDr8HNcXPayplO8yJFO4fMpqKXiVGTu7L9to0kDNbPCiiypzdR7mBjLONgC56PscKRdAPPWby1-3C7qcGPeJtucp-RNTdixlI0jsZ1MjQk3u_BWFRW2oqT8GgdxNi1a0ngMxPqEZvParDPr8HaN2zK0DPZ7y894Sq7NaDo10efVsIMU5FcVOjT76JoFm36DPAB62zgPADZyR57aUNcUnRlJp6Z5zynznm7avk4muvwLnbTtRb3v-GCm1G5x7XfR5sXPJbq1hzajs6qwopVM3zH0QyWdzs8-zbs7-_Bs5r4m8HeXqpqlZ1meqjDr8HT-bc7U-Zdn4-qMwsbTds-utBZm42e1MbhRmk5Boyydz8-lJB0qzytI0LgrM1U9uyDt5VlR-tCnbvzY_jzncvvjsxmihsZTy1R8EScfI7t02pWpTkEjU53PzyZThorxsCo6_yFS1Tg-n7X6lupiwZ9L40udF0cqb4tX5-vzuf2Wyv9Rl1nxfwvHEnty18xg_Zjux70TfqtwcbJvFT1b_w0N52PqGCrPK21bWVb-NcKmg3i2p6vxMJqvjZPRfHsufW5I_M2Z20TydoHzc5yGvYF8q_RWHN8qez59tkQcS-WJZ4zPKoEJYC_Lg25U1fk-73Tn63OJlyFiZouKzL-5iNGVuLydAGfLmw6H59_m3J1_eS7Ozgg8L0_r1QH0F5hFc7pxospFu9j-POdu--OzZUcaGk-sp5t5oFK9nWSq68R2vjd9bX99pFmqd3v1dteScSo6q3ZY3Df3szPNbw_xzJvIct2U3_I1OqXP524AGWdO557KZfVoQL0S5RuOgSfz3iA4ylKbwdj9cZlk9bSfTcFIvl2zn8Lbzb2lgQbv8EBVVOd5jzk_d1M9uZnTaGtPNz-7wME-G1Ez0BY1LLzNtfrnqS7tem21Imt-Wr5ZiIP0clpaJG_XJnER_G4Wko9sE4syt-e1d_f2drfPDn7drTdbtqvYpv-eTie-CX6q_5uVpAryVNt1eqeY-kX18-3ar7G-tg3ZAcmNk8L0JknUZdHSE7PkWrc8gXpLsFkocFFn-cd-XA3AMKbdHzo3Oa3PKg_yWA-2a15-R6MqguawgdmcOoTNHB8eRlQthJpkW3WAYoBT9vD2MBaTMB3sjilcUvdgcqmSQcp16R2cKM2iO0hoHMWB2de7fMjNEn0FtYQv82Nhg-Nd77kfxmHPYw8hqAqHK1dHo4dq16VLuGqPZQ9ytSodrr6jAzXY96pwuPL8TE5WBZD9WOZQSzB9yFIr5KA0m3Fi9scPjuxuoucgwwg_lmOd11ubhzAdgY2agSxVnDz2p-WwGrcglvDKnigc4JApG65arXkP9MGULbFEnSNiAwxtwwyjqs5QDRqyZVWrsxKD_KtPXiwZgnqbwQD7q9IlTJgdvxrof128REms_d28yuKwOn0zoC4LYMsMRmY2zzwWjT1S9Hg0i2eMHo9xL1HFt8HxrkuHq5-XsXFoerBUPstKSIxSPQ6D0a3HYTgDR7Kc5vrBCE4WPZGm7slyH2R-Jqa38qx0meWoj8o8GEN1oOfB1esk-ANrW_sPkYSGHiydAOYwS_SjnKZN2PIoVLZZ_Yak6d29cFVTYW9P742xUvD6ZP0yG1CB3IEI5vL9Jd7iapjm5-b2tUrMPTJZ8jiEt24QeAwycwR4eqnScIbuY5-P3ozDitzLygJw2oNiO-ak8WN5aKLFHkTD7XqzMYvq7BEyE2fV59tOy9wcb_sjyyZfbMBpftXbZUm9RRY87p0Yxi238jajYwB_m53_e2NTDPV-XfN7vl13GMG00HV21ya0bI3WJluDpb3B9sTm1l47J5snu6MtbTYVAeJ8dBaXKo2nE-f0MgYIp3J8RpUXVP_12kEYj9qO0ZYqZre7xIl-7bivJOfe6DyNv0-1c7Dz2pEB4kiFrse08ELiaxlG2EdcRlwE2sNSIkwCFRAXSkMuIsWlEh5jHleBK_TIdsCy8rUj-KjeTPzawe6o3v__2nn3cuvlycgCnejvrx3PHUHglMRBbErR6AXCP5s92XYLfeVXGUMzEuhnk9SYbXuxAY2Bs47ICLmyXWz9gWZvDAx5_E3XlUYvMDMVJ5UaOR22jV5It11oJlBokrBNMllk8N2NtQKkTduK0QtKLIQ5JdxutElAHGXhiUovtJObf0F8XrG1epTrFMUgBL4TgtwJQe-EYHdC8DshZnee2MRbV5hxjzAfxSkM0lgnZjf-2TX4ShfjEhh3AQKjbguyJ5ZKMmoLsYg8xF3OCZIoFFJoKZQ576h55PqeRNrliARRFIVaRS7lkUKS8pBhjzLCo2glIT55acR4y_zbEmVB26JMRn8G5kSBDv8p2rJpkl4GxKmnMweYGkexzkHoTKw7DUGgEEi7Wd6ubxWod3c5UZ5NzBpk4ZTG0jnKHiLJirrciHYlhwuS31wY50TZbEv5vBKVps5BWoLSxBfa6ghy-bCSgJno9KirQZTbNszPsrcVAnVYYdwSB-aJSomd2XUUDeN4G7oJUv-_06slEOJOCDmsm6RHN7ezHCZXMGVxMnpn7RmMYVvDWOCRSLFIub6P3cjTgRvR0KcSu6EUAdOUs4hh5COC4BNjmFE_cj0fFM2TVHQ1jLQUiLPuXIA6Yla10qhFNfVG2TQNzXyBjLjt6B9mq215M3oh2G15ZkyYj7NcGSAz6c3RS-ShtpybkAtQMnRrEvjPErk-YaB9hlpPsvzGeZ9Og2-JHv2SJYZtzm4xtqel2mKBYOCxDLTwCZOuloygIJQw4AH2QoyVj3wcmPvAKPe0CkWIfMZ8nxCqeKRDvysWrG1XOy4CHtG2VFRLA0Nz_Xmhi2r5wSHUMb5tYAMvsD1xqq_B0HaQdUYcd6TPnnjzkywLnQtljmtZZjjAhtScIvNvnHIcFxVY9bVwSMdlGfBGqBG1qokg2vU5sWmxiPOxAvgU4rVEeFhXeM4_HHw6B_GB-cXybATBz9WNswUzfltmAh4EYUhwqBSJQiK1q8HDDBiNNBVEeyyIPOkLkCKmaIh0CDbGY57kgZQ4ELIrM7QlM5QuuJXEGgXgvU4vyjH8LResBvJ6_c4XuN-1g67FgVPneZwqDeIEKk2z0vG1A4IXQnOi0h4BpU4_uFl-A0lJbszVF4kZbh3nValT53UN7Zts2kdvDtKQzUFfr4Dy38JaLREn3itOB2kYX2TpaH_q56AX23EeJLpc9Bex590R-FCX0bYYUhnRSPoEiQgJhYUGFIIiKjzCXSWQ9AMvCrnmXkA1Q5GE0MdzfUoRZ5QGZHQ6VpfgW5nmj3aTcPZzQTp7XcnbbmQ3InJHyMPD3pYcNF-1N-UI60maic25HuvqSCyYF0dZsEqSRh-y9GVcCWP1eeaLVS5nLa_Ac4hWs1khUAQH1E6ZrNNEc59my5gZl1OrYAz9NsGVCZ4sDYjSUuP1m5FJbkbGd10M4WZ-7wAG05exutILqNad6aXRG4B2f35-XXjmednrmZd3J5c3wKgU5ob4cvRZ5daBrnaq3oqfpLgrESAx7sRQvi-1Z67uCwVYYCUFqIP0PPD3BCOBJBBjRZ6vSAjKolQYeEi6DJxB-MwCilaKoSrBfzcYP2ErED1B0HaWgvDVR7etWa4DGbNCZ85yG6AsnUU5EC6N_rSH5Kcgsf-Ucknowm57jmZa6MQgBqddZB694Ox2roDQ3mlkHtKs0qkmdKp79t94ZzHe6VMU0RfNjOMJTPCB9bpCPVcVu03v8ZriI06xT0AT_IBDnMOZiHwRyBAmEs3DiPpcgfoglzIfIiHuYxUQ4QoIO1TACV4xZWazDUs0xUp-v2CBhd79UeaqkshanjqWdrPKt1YyvbKmoNsxFpG9ntILSocTAuZWhobI7Gq5ujEIzLd5faBO9dlVB_ByDAoY1yQx7Z3p1QtG_8Njtn9dmkD2emO7NxBb1ddlvIMBLK-zJBrNfzlnIMrFRKVtfSG-4loErqciLCnBSgjiykBQ6vnmJn4Gzj2FCQeHTOgQE9AhX1AuI0U1RJa8qy_uQL5tMwEdVyU07xSKTYI8K8FaV4nlgYCxSZGNuv5WR6Jm9PqSdo4CBQuzqdmbZrIo-fSy_LdyxfuGFrk9RvM4URdTbZcXVAKRRxpHfYmgkMPQmdvUhCvd0PPCiGA_wKH2NMbIC5CSXhi6XsTcMCCIYREFnm-fMBAh1WI44ueiPbIUgjPnONdR_KPhu0rMjS_h6CV2TqdRu6iYl90aLYgZqlBpq4q_LwCIdSzQIplWTvYFss5n1-hthmHhWFtI276INVfVxR2OMvkCcIhNFPcC2bRqvWFjloWCGJPfMl6NZUNd02Yd7v-atqcxbah3rQ1-l4l2jsHHHp2W2Tcz4_yWXd5OejEpGdF-qKjvcY5EKBDCxNN-pCXimoSMeJJwAu40AQeBRy5nbkRpGBLB9KKnvCzp1ZmyZ2v5xvw2K1KzTWXG-TUrpjEIbTsB5jpnlam-sQc_nP3sOinmawaLHivGy9NfPbh60lazVNgLCENVGMam1dDURS-lwtk4K02nao9lRWo2PJ2RROSOZbu_KqXWK3i4d1KFboCzM5tVsxAMTzE6Nk8x6QA6r9KwM52iEGFPBpEMtFReBH4nk2EYRTqKIhq5HvaFiHikXKUlYZKCiaYRDYUiEKq5Cyu23nCgdjJonPFdy1zzoe6zqdQdivlHpFu2IDGVy2uWmlb1eW0FQpZXuBVOMrS8wq1Q7UVn6aDaA25zIa2LU2qg_kKYziaTLP27JPH-5VEfIr2KBHZirkeV_pTVclaV8GopUeSZ63OpJpEGEx2EnhbYB3sOIZ0IhNKKBjjCYaQiT4ClD6irAi_0wORrQiVWiza8rUSN1mCvm5Cea43JFFeZuXpPmJPbVFc0TRJwWq3LUW_5mUGMCF3YDGHrmRQk2ERjQ4z9U4aLYTZxduKr-gJmx1yfZ7Np2K3vYC0q2jZf_YzWbmFx6Wjz3cH2aEf54CzPjxX_okJdZ7brgbNb6lV7sHQQMEUwD4WvXcwxxA0o8iGkjjzmMRhBxQMSwaCJKAKDp3zsuyY254QyzRctXmuw2mPFvQEL53VMkrbp96bUGIzCSbP5gITT3K6WVXAYwuO8ugNsPoEvJD1rjLxDpussLiD9905dIrbCsH-axuAmx4lJVndGf3usdanGnZADpi7lIxpFvvTsGjMFbwvLCHOuPcoCLAkNhK-IZG4QCqZcTKLIdZlE2hfd3R3gzw-Mv3iW8Rerjn93UbKbFPl7jT_vG_9NXwMP7Mm7mQzsxGpiDiR3xv8E-Oln1-3xd7nrSVfjEAGKCPvMJ4EbMBZEPnjfLogF1iFDEQbH3CO-ee5REORCBMW1iJBe3HvQP_z0OYaf8FWHH7sdX7nXd_17iYG3ghk4XbAAB2l1JUAn3IokEhGOQs0Y9rCKJPWVGxLCGTi9CKZvjwiJYMRVGMD_hS80DpT0kUI80MGgv-sO7kJ5suHHqw4_Y3dvG_h7Db_o3c861pOsHDs7INQQZh8aps1uzHN-0dc66UQ6KnJBpSn3fI0JJdSDsFtqGUWBq1wPzIlGXEVcBTAfBOCycQ9CI-S73NdMyW6uyfPawz2YRTSpHeHU1xDXi5mthRwHAExg0im3SUDbeqcOoDoITZAzMQHpQi0bsr628d08bxRqGHXUicLr6OM6Br7ZbYAWvg77R0vwN3Hxa-dF_wZb1Ncfs-S7o8EBKVWZ5cMw1fYOaJLZ0DkIdQo4JjN9Ny_a_XeDbHV5fV8Ac6jLscmU2GWr2ZMutxXDxZ7ZeBUJHYD948KDUJ_63EUBCZTPiTTvNoBaeIiFCqIVypAKEEJcILCQKljcpFC9y_rasfrY3YiwnU0mMGjaPEkNrnpejONLx-4xsI88Otcqz-MsL5xparZAnKhvsSrVqBaDAuQY2GKwWyXZzlLoQz5L4Wjnvcqn8Wgf5DHL4-AvE43ePctu75BUJzhuHLN9Gbjhw189AxIaq-SCt4E41b7reQHjPOI-Ip5EIUUsCGFcQua7SoYeDnwd-hSFKOQ8DMNgcUlwyYB016a7CxX158pEzN8jK6qFuEibwThpBuMMmFNAXDipFqDr3UhZtctClWYnxc-1Wxbn1XtDT77E0TsQqH9fmdkpnoEwxiDARzo0hyEGpw7suTwyK7CuVAj5hEa-B8wH94AqCaOhzRkGKIWZ2Wechh6TUaiMUhEkFFWLGtIZAjtJ0MVJ4i5L73yAmc9k_gdNpRGxaJqYS8DuY08HQT-b_1fblP4t16buNr-94tGfRN3Lpomf5alTXWgN_DjUyl7fPAJ3alJAMH1LSgSIONeu9AOCJXf90JPEeI8CMwKepmeEAUyrDnyQEqpEyAVYXSKJiTEj40R0I4slavvnZArTKTgEB5HxF0EWzH0WhTNbtgwb5Vx3Ps_2bNkLO5TZBa2dSXVvx7otuKi2vYB2Go-gWerqpnmGODiQPVNlMG58890bPYKJqDA30QQ9zpkXSUYkcpnyAxVI5mFM_AjBTCQD5IXSpyYIjwIFQTp2FZIMzKAWhEoZRpQvJmU63OJ9Nq67G4H1gVT70gYNZLVZqLJqR62CJrV71EfLuR7HiXaU9buruau-A2lklhuazQqz7XdzEoB6Yf9dpZzDCP_22kkHtDP3Y7BSKcR6uhgPTqTaRRystBQQ6YcQ5GFfKO5GjKMIUQEiRFzf9QUIFxM-qK4CmXPB15GEeL4XhYtSBd7-FIxB4djXppwzDVKm8gVzPt85sK9y0DJ73OB4moMawJQZNRsOjcMyMUpiorDJbGUDDEu7d2py31myl43sTjZaQkOWDXyMiAiPUuIxTDAOsHClFgF1QwV2TbiECAKBNUeeKwRMhiH4I0q6GGMXQ-z8r-djJSWP5iN_sslC0VALJMII-RimAAhLIw4OHuXAPXApqKAwU3CFOAmQ8MAMKi4iLEMErA6IQn_XyaJvK-qv5mZQ510STybgW9wRxnvCBXXVyFd-SD1ElPaZGyIJMUzAsPTMQ9VhAHOD9mmgXarAOWbEJUHgeTDvdhnHZSuMZ_TfJ4zvBu23lghXjdNp58TCsBcYxGZ_YlItDxyEWt3hMTo7eZx-WxaofzbvG11C-0OTninz6fyFqf8eZxW9VuQ8TVU5zSFgBzNSmkszQDEgdI9Vj_lgYQiWggWccl8HQchdgqRvTh1IjLXLaSCiyIPgkEGcEsIvySCE0YKJgMF4RUMhohWpfkM8IG9NFFjFJWkdl8yWEKGGn6XTotrpd56qFdE9T0hoHqAaPkPffZvKau1BeH5yuPjSXnVXW6Xcrcf3jn2Abe6NO02ysvO9rtfcRTl_2g_fVcdsnHNa7-K5d1Uw56ScTf-mKNTMADn4HvVnjVzEwe6PA6-Eo4fb1XOFbWY3Dxjek9fO6bW6XGwHfwJ-8Cfgx31w2F3niwjuIxjVUwmLGNAjRetBbOgbE_YEY4KeYEzQE7SD3pOpDTh7lFw_hZ6vhqO6u2R2OUmFsVp-a40jIg8SavxIkSSP7EH7cVh6VwOqc1OPEaJ-veSP7ER7kmFLbW31HG7H2DYv5K5obfu5cB-V3pxME91SBPlQ-SVPYAPIivNU_aBvm3etN34XedeDoH46uI2g9ZrwCgjqd3g7LWie5n3U6NFHSmBLjZF3ZxPsFtyW0NKVHKMWDXKv2eceQjJ7w2NWwXuQUWOP5GZLJBF_mEnBjzZKj3c36GM9HvqQKa5vrryXT9089_n0lp49VY_Qilarete8bTKal85XtBhLGIJX9fGr9747807zBPjK7egRkXt71Q28eJip5Pc2J4-RRmv52vP7g-e5J1Mm9jTK9Hg-PtZ3pI-sj56GEeSpoqr7m6emAn8UZfxYS_-QYK6lFPfgflMLr-antOmgRwwzfRppefAMsqKp9iRfSMdUX1b0UTmiSC5GGPbTfSx9j7Kxp9KSVf19ijBfmLPqT_fPTOEnCN7xU2W3-hE92fRwG1GVna3e0zDXrKpQn9orVj9rs-RRVPew2sva7DMbWRrFF7V7XP1R35lq68-_OGVcJrr1iko7r9t-bmNa6NaL5fProv0sS7RKawd843Y9kz22m6vttbL1TQL3rmdfRbDPy65e0TzGUl2jf2edS5WWY52lR-prlr_LwuYFkrOx3oJf-n3z5myn5k5cmCXC3f1js8fhY1pf1X4nxcn8BLzZrGBv1JldqNM8ZiJc1-2r7CvTxdYzKbmaxHkvpDmVZPe4jnV4llle3ocfcbrAjy_Ti2mylO376kp33xG451hXj1Dcq57Zt92wr7fecaICPc7sfVFVbW2IVS-YzDnuNQwfqGCvAK2fIJhXI3fVmi9Lzl6Lmb9Xgym6i2I-f1NkXo3dUcfsN15sJLuza_DlAe0ztB5Qza6otWSdDsM3yvI5NreY6_DUvk5j3iI61UnUYEFshT7emzHz0Ts2N4DPB33VWvcfCCNjiywVkt9Rbf5wxZwbLqJkBYbcq1tVu06yJLGriW3dGa55GmT2NnCz177VvuEKRetpW6hm55oVqtkWznzUGTxHUsg76szOHD9QPxer3WkQjNKsyvbTMcwpA7x7szGfyquL2O1f_xi92ThW5fhjZG-FBxn8x-j_Ad9v2w4=";

  const result: PathOfBuilding = {
    export: input || "",
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
    spec: {
      masteryEffects: {},
      nodes: new Set(),
      treeVersion: "",
    },
    items: [],
  };
  if (!input || input.length === 0) {
    return result;
  }
  const xmlDoc = pobstringToXml(input);
  const spec = xmlDoc.getElementsByTagName("Spec")[0];
  result.spec.masteryEffects =
    spec
      .getAttribute("masteryEffects")
      ?.slice(1, -1)
      .split("},{")
      .map((pair) => pair.split(",").map((num) => parseInt(num)))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<number, number>,
      ) || {};
  result.spec.nodes =
    spec
      .getAttribute("nodes")
      ?.split(",")
      .map((num) => parseInt(num))
      .reduce((acc, node) => {
        acc.add(node);
        return acc;
      }, new Set<number>()) || new Set<number>();
  result.spec.treeVersion = (spec.getAttribute("treeVersion") || "")
    .split("_")
    .join(".");
  const build = xmlDoc.getElementsByTagName("Build")[0];
  result.build.bandit = build.getAttribute("bandit") || "";
  result.build.level = parseInt(build.getAttribute("level") || "0");
  result.build.pantheonMajorGod = build.getAttribute("pantheonMajorGod") || "";
  result.build.pantheonMinorGod = build.getAttribute("pantheonMinorGod") || "";
  result.build.className = build.getAttribute("className") || "";
  result.build.ascendClassName = build.getAttribute("ascendClassName") || "";
  result.build.mainSocketGroup = parseInt(
    build.getAttribute("mainSocketGroup") || "0",
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
      skillsElement.getAttribute("activeSkillSet") || "0",
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
        "Socket",
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
          itemElement.getAttribute("id")!,
        ),
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
  arg: string,
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
    mutated = false,
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
        case "mutated":
          mutated = true;
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
        case "mutated":
          mutated = true;
          break;
        default:
          tag = key;
          break;
      }
    }
  }
  return { fractured, crafted, mutated, line: line.trim(), tag, variant };
}

function extractMagicBase(base: string, numMods: number): string {
  if (base.startsWith("Synthesised ")) base = base.split("Synthesised ")[1];
  if (numMods === 0) return base;
  let end = base.indexOf(" of");
  const hasSuffix = end !== -1;
  if (!hasSuffix) end = base.length;
  base = base.slice(0, end).trim();
  const baseTypeWordCount = getBaseTypeWordCount(base);
  const wordCount = base.split(" ").length;
  if (
    // has prefix
    numMods > 2 ||
    (!hasSuffix && numMods >= 1) ||
    wordCount > baseTypeWordCount
  ) {
    return base.split(" ").slice(-baseTypeWordCount).join(" ");
  }
  return base;
}

function getBaseTypeWordCount(name: string): number {
  if (
    name.endsWith("Life Flask") ||
    name.endsWith("Mana Flask") ||
    name.endsWith("Hybrid Flask") ||
    name.endsWith("Arrow Quiver") ||
    name.endsWith("Shield") ||
    name.endsWith("Talisman")
  )
    return 3;
  const counts = Object.entries(baseTypeWordCounts).flatMap(
    ([count, baseTypes]) =>
      baseTypes.map((bt) => [bt, parseInt(count)] as [string, number]),
  );
  for (const [baseType, wc] of counts) {
    if (name.includes(baseType)) {
      return wc;
    }
  }
  return 2;
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

  // Parse explicits and mutated mods
  let firstExplicitMod = -1;
  for (let i = idx; i < modsEnd; i++) {
    if (isModLine(lines[i])) {
      firstExplicitMod = i;
      break;
    }
  }
  const explicits: Mod[] = [];
  const mutatedMods: Mod[] = [];
  if (firstExplicitMod !== -1) {
    for (let i = firstExplicitMod; i < modsEnd; i++) {
      const mod = parseMod(lines[i]);
      if (mod.mutated) {
        mutatedMods.push(mod);
      } else {
        explicits.push(mod);
      }
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
    mutatedMods,
    slot,
    id,
  };
}

const baseTypeWordCounts = {
  1: [
    "Stiletto",
    "Skean",
    "Poignard",
    "Trisula",
    "Ambusher",
    "Sai",
    "Awl",
    "Blinder",
    "Gouger",
    "Cleaver",
    "Tomahawk",
    "Sabre",
    "Cutlass",
    "Baselard",
    "Grappler",
    "Gladius",
    "Smallsword",
    "Estoc",
    "Pecoraro",
    "Tenderizer",
    "Gavel",
    "Pernach",
    "Sekhem",
    "Quarterstaff",
    "Lathi",
    "Woodsplitter",
    "Poleaxe",
    "Labrys",
    "Fleshripper",
    "Longsword",
    "Mallet",
    "Sledgehammer",
    "Steelhead",
    "Piledriver",
    "Meatgrinder",
    "Tricorne",
    "Sallet",
    "Chestplate",
  ],
  3: [
    "Great White Claw",
    "Blunt Force Condenser",
    "Crushing Force Magnifier",
    "Impact Force Propagator",
    "Blue Pearl Amulet",
    "Full Scale Armour",
    "Fingerless Silk Gloves",
  ],
};
