import { GameVersion } from "@client/api";

export type ClassDef = {
  thumbnail: string;
  image: string;
  classColor: string;
};

export const ascendancies: Record<GameVersion, Record<string, ClassDef>> = {
  [GameVersion.poe2]: {
    Warrior: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Warrior.webp",
      image: "/assets/poe2/ascendancies/Warrior.webp",
      classColor: "text-red-500",
    },
    Sorceress: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Sorceress.webp",
      image: "/assets/poe2/ascendancies/Sorceress.webp",
      classColor: "text-cyan-500",
    },
    Mercenary: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Mercenary.webp",
      image: "/assets/poe2/ascendancies/Mercenary.webp",
      classColor: "text-orange-500",
    },
    Monk: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Monk.webp",
      image: "/assets/poe2/ascendancies/Monk.webp",
      classColor: "text-purple-500",
    },
    Huntress: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Huntress.webp",
      image: "/assets/poe2/ascendancies/Huntress.webp",
      classColor: "text-green-500",
    },
    Witch: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Witch.webp",
      image: "/assets/poe2/ascendancies/Witch.webp",
      classColor: "text-blue-500",
    },
    Warbringer: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Warbringer.webp",
      image: "/assets/poe2/ascendancies/Warbringer.webp",
      classColor: "text-red-500",
    },
    Titan: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Titan.webp",
      image: "/assets/poe2/ascendancies/Titan.webp",
      classColor: "text-red-600",
    },
    "Smith of Kitava": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Smith_of_Kitava.webp",
      image: "/assets/poe2/ascendancies/Smith_of_Kitava.webp",
      classColor: "text-red-700",
    },
    Chronomancer: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Chronomancer.webp",
      image: "/assets/poe2/ascendancies/Chronomancer.webp",
      classColor: "text-cyan-500",
    },
    Stormweaver: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Stormweaver.webp",
      image: "/assets/poe2/ascendancies/Stormweaver.webp",
      classColor: "text-cyan-600",
    },
    Witchhunter: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Witchhunter.webp",
      image: "/assets/poe2/ascendancies/Witchhunter.webp",
      classColor: "text-orange-500",
    },
    "Gemling Legionnaire": {
      thumbnail:
        "/assets/poe2/ascendancies/thumbnails/Gemling_Legionnaire.webp",
      image: "/assets/poe2/ascendancies/Gemling_Legionnaire.webp",
      classColor: "text-orange-600",
    },
    Tactician: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Tactician.webp",
      image: "/assets/poe2/ascendancies/Tactician.webp",
      classColor: "text-orange-700",
    },
    Invoker: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Invoker.webp",
      image: "/assets/poe2/ascendancies/Invoker.webp",
      classColor: "text-purple-500",
    },
    "Acolyte of Chayula": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Acolyte_of_Chayula.webp",
      image: "/assets/poe2/ascendancies/Acolyte_of_Chayula.webp",
      classColor: "text-purple-600",
    },
    Deadeye: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Deadeye.webp",
      image: "/assets/poe2/ascendancies/Deadeye.webp",
      classColor: "text-green-500",
    },
    Pathfinder: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Pathfinder.webp",
      image: "/assets/poe2/ascendancies/Pathfinder.webp",
      classColor: "text-green-600",
    },
    "Blood Mage": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Blood_Mage.webp",
      image: "/assets/poe2/ascendancies/Blood_Mage.webp",
      classColor: "text-blue-500",
    },
    Infernalist: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Infernalist.webp",
      image: "/assets/poe2/ascendancies/Infernalist.webp",
      classColor: "text-blue-600",
    },
    Lich: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Lich.webp",
      image: "/assets/poe2/ascendancies/Lich.webp",
      classColor: "text-blue-700",
    },
    Amazon: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Amazon.webp",
      image: "/assets/poe2/ascendancies/Amazon.webp",
      classColor: "text-green-500",
    },
    Ritualist: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Ritualist.webp",
      image: "/assets/poe2/ascendancies/Ritualist.webp",
      classColor: "text-green-600",
    },
  },
  [GameVersion.poe1]: {
    Scion: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Scion.png",
      image: "/assets/poe1/ascendancies/Scion.png",
      classColor: "text-white",
    },
    Ascendant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Ascendant.png",
      image: "/assets/poe1/ascendancies/Ascendant.jpg",
      classColor: "text-white",
    },
    Shadow: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Shadow.png",
      image: "/assets/poe1/ascendancies/Shadow.png",
      classColor: "text-cyan-500",
    },
    Assassin: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Assassin.png",
      image: "/assets/poe1/ascendancies/Assassin.png",
      classColor: "text-cyan-300",
    },
    Saboteur: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Saboteur.png",
      image: "/assets/poe1/ascendancies/Saboteur.png",
      classColor: "text-cyan-600",
    },
    Trickster: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Trickster.png",
      image: "/assets/poe1/ascendancies/Trickster.png",
      classColor: "text-cyan-400",
    },
    Marauder: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Marauder.png",
      image: "/assets/poe1/ascendancies/Marauder.png",
      classColor: "text-red-500",
    },
    Berserker: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Berserker.png",
      image: "/assets/poe1/ascendancies/Berserker.png",
      classColor: "text-red-500",
    },
    Chieftain: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Chieftain.png",
      image: "/assets/poe1/ascendancies/Chieftain.png",
      classColor: "text-red-600",
    },
    Juggernaut: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Juggernaut.png",
      image: "/assets/poe1/ascendancies/Juggernaut.png",
      classColor: "text-red-400",
    },
    Duelist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Duelist.png",
      image: "/assets/poe1/ascendancies/Duelist.png",
      classColor: "text-orange-500",
    },
    Champion: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Champion.png",
      image: "/assets/poe1/ascendancies/Champion.png",
      classColor: "text-orange-500",
    },
    Gladiator: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Gladiator.png",
      image: "/assets/poe1/ascendancies/Gladiator.png",
      classColor: "text-orange-600",
    },
    Slayer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Slayer.png",
      image: "/assets/poe1/ascendancies/Slayer.png",
      classColor: "text-orange-400",
    },
    Ranger: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Ranger.png",
      image: "/assets/poe1/ascendancies/Ranger.png",
      classColor: "text-green-500",
    },
    Deadeye: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Deadeye.png",
      image: "/assets/poe1/ascendancies/Deadeye.png",
      classColor: "text-green-500",
    },
    Pathfinder: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Pathfinder.png",
      image: "/assets/poe1/ascendancies/Pathfinder.png",
      classColor: "text-green-600",
    },
    Warden: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/Warden.png",
      classColor: "text-green-400",
    },
    Raider: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/Warden.png",
      classColor: "text-green-400",
    },
    Witch: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Witch.png",
      image: "/assets/poe1/ascendancies/Witch.png",
      classColor: "text-blue-500",
    },
    Elementalist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Elementalist.png",
      image: "/assets/poe1/ascendancies/Elementalist.png",
      classColor: "text-blue-500",
    },
    Necromancer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Necromancer.png",
      image: "/assets/poe1/ascendancies/Necromancer.png",
      classColor: "text-blue-600",
    },
    Occultist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Occultist.png",
      image: "/assets/poe1/ascendancies/Occultist.png",
      classColor: "text-blue-400",
    },
    Templar: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Templar.png",
      image: "/assets/poe1/ascendancies/Templar.png",
      classColor: "text-purple-500",
    },
    Guardian: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Guardian.png",
      image: "/assets/poe1/ascendancies/Guardian.png",
      classColor: "text-purple-500",
    },
    Hierophant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Hierophant.png",
      image: "/assets/poe1/ascendancies/Hierophant.png",
      classColor: "text-purple-600",
    },
    Inquisitor: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Inquisitor.png",
      image: "/assets/poe1/ascendancies/Inquisitor.png",
      classColor: "text-purple-400",
    },
  },
};

export const phreciaMapping: Record<string, string> = {
  Antiquarian: "Berserker",
  Behemoth: "Chieftain",
  "Ancestral Commander": "Juggernaut",
  Paladin: "Champion",
  Gambler: "Gladiator",
  Aristocrat: "Slayer",
  "Servant of Arakaali": "Trickster",
  Surfcaster: "Saboteur",
  "Blind Prophet": "Assassin",
  "Daughter of Oshabi": "Deadeye",
  Whisperer: "Pathfinder",
  Wildspeaker: "Warden",
  Harbinger: "Elementalist",
  Herald: "Necromancer",
  "Bog Shaman": "Occultist",
  "Architect of Chaos": "Guardian",
  Polytheist: "Hierophant",
  Puppeteer: "Inquisitor",
  Scavenger: "Ascendant",
};

export const poe2Mapping: Record<string, string> = {
  Warrior1: "Warbringer",
  Warrior2: "Titan",
  Warrior3: "Smith of Kitava",
  Sorceress1: "Stormweaver",
  Sorceress2: "Chronomancer",
  Mercenary1: "Tactician",
  Mercenary2: "Witchhunter",
  Mercenary3: "Gemling Legionnaire",
  Monk2: "Invoker",
  Monk3: "Acolyte of Chayula",
  Witch1: "Infernalist",
  Witch2: "Blood Mage",
  Witch3: "Lich",
  Ranger1: "Deadeye",
  Ranger3: "Pathfinder",
  Huntress1: "Amazon",
  Huntress2: "Ritualist",
};
