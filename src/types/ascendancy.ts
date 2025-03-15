import { GameVersion } from "../client";

type ClassDef = {
  thumbnail: string;
  image: string;
  classColor: string;
};

export const ascendancies: Record<GameVersion, Record<string, ClassDef>> = {
  [GameVersion.poe2]: {
    Warbringer: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Warbringer.png",
      image: "/assets/poe2/ascendancies/thumbnails/Warbringer.png",
      classColor: "text-red-500",
    },
    Titan: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Titan.png",
      image: "/assets/poe2/ascendancies/thumbnails/Titan.png",
      classColor: "text-red-600",
    },
    Chronomancer: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Chronomancer.png",
      image: "/assets/poe2/ascendancies/thumbnails/Chronomancer.png",
      classColor: "text-cyan-500",
    },
    Stormweaver: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Stormweaver.png",
      image: "/assets/poe2/ascendancies/thumbnails/Stormweaver.png",
      classColor: "text-cyan-600",
    },
    Witchhunter: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Witchhunter.png",
      image: "/assets/poe2/ascendancies/thumbnails/Witchhunter.png",
      classColor: "text-orange-500",
    },
    "Gemling Legionnaire": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Gemling_Legionnaire.png",
      image: "/assets/poe2/ascendancies/thumbnails/Gemling_Legionnaire.png",
      classColor: "text-orange-600",
    },
    Invoker: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Invoker.png",
      image: "/assets/poe2/ascendancies/thumbnails/Invoker.png",
      classColor: "text-purple-500",
    },
    "Acolyte of Chayula": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Acolyte_of_Chayula.png",
      image: "/assets/poe2/ascendancies/thumbnails/Acolyte_of_Chayula.png",
      classColor: "text-purple-600",
    },
    Deadeye: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Deadeye.png",
      image: "/assets/poe2/ascendancies/thumbnails/Deadeye.png",
      classColor: "text-green-500",
    },
    Pathfinder: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Pathfinder.png",
      image: "/assets/poe2/ascendancies/thumbnails/Pathfinder.png",
      classColor: "text-green-600",
    },
    "Blood Mage": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Blood_Mage.png",
      image: "/assets/poe2/ascendancies/thumbnails/Blood_Mage.png",
      classColor: "text-blue-500",
    },
    Infernalist: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Infernalist.png",
      image: "/assets/poe2/ascendancies/thumbnails/Infernalist.png",
      classColor: "text-blue-600",
    },
  },
  [GameVersion.poe1]: {
    Ascendant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Ascendant.png",
      image: "/assets/poe1/ascendancies/thumbnails/Ascendant.png",
      classColor: "text-white",
    },
    Assassin: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Assassin.png",
      image: "/assets/poe1/ascendancies/thumbnails/Assassin.png",
      classColor: "text-cyan-300",
    },
    Saboteur: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Saboteur.png",
      image: "/assets/poe1/ascendancies/thumbnails/Saboteur.png",
      classColor: "text-cyan-600",
    },
    Trickster: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Trickster.png",
      image: "/assets/poe1/ascendancies/thumbnails/Trickster.png",
      classColor: "text-cyan-400",
    },
    Berserker: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Berserker.png",
      image: "/assets/poe1/ascendancies/thumbnails/Berserker.png",
      classColor: "text-red-500",
    },
    Chieftain: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Chieftain.png",
      image: "/assets/poe1/ascendancies/thumbnails/Chieftain.png",
      classColor: "text-red-600",
    },
    Juggernaut: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Juggernaut.png",
      image: "/assets/poe1/ascendancies/thumbnails/Juggernaut.png",
      classColor: "text-red-400",
    },
    Champion: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Champion.png",
      image: "/assets/poe1/ascendancies/thumbnails/Champion.png",
      classColor: "text-orange-500",
    },
    Gladiator: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Gladiator.png",
      image: "/assets/poe1/ascendancies/thumbnails/Gladiator.png",
      classColor: "text-orange-600",
    },
    Slayer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Slayer.png",
      image: "/assets/poe1/ascendancies/thumbnails/Slayer.png",
      classColor: "text-orange-400",
    },
    Deadeye: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Deadeye.png",
      image: "/assets/poe1/ascendancies/thumbnails/Deadeye.png",
      classColor: "text-green-500",
    },
    Pathfinder: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Pathfinder.png",
      image: "/assets/poe1/ascendancies/thumbnails/Pathfinder.png",
      classColor: "text-green-600",
    },
    Warden: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      classColor: "text-green-400",
    },
    Raider: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      classColor: "text-green-400",
    },
    Elementalist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Elementalist.png",
      image: "/assets/poe1/ascendancies/thumbnails/Elementalist.png",
      classColor: "text-blue-500",
    },
    Necromancer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Necromancer.png",
      image: "/assets/poe1/ascendancies/thumbnails/Necromancer.png",
      classColor: "text-blue-600",
    },
    Occultist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Occultist.png",
      image: "/assets/poe1/ascendancies/thumbnails/Occultist.png",
      classColor: "text-blue-400",
    },
    Guardian: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Guardian.png",
      image: "/assets/poe1/ascendancies/thumbnails/Guardian.png",
      classColor: "text-purple-500",
    },
    Hierophant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Hierophant.png",
      image: "/assets/poe1/ascendancies/thumbnails/Hierophant.png",
      classColor: "text-purple-600",
    },
    Inquisitor: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Inquisitor.png",
      image: "/assets/poe1/ascendancies/thumbnails/Inquisitor.png",
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
