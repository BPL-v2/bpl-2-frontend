import { red, green, cyan, blue, purple, orange } from "@ant-design/colors";
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
      classColor: red[7],
    },
    Titan: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Titan.png",
      image: "/assets/poe2/ascendancies/thumbnails/Titan.png",
      classColor: red[4],
    },
    Chronomancer: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Chronomancer.png",
      image: "/assets/poe2/ascendancies/thumbnails/Chronomancer.png",
      classColor: cyan[7],
    },
    Stormweaver: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Stormweaver.png",
      image: "/assets/poe2/ascendancies/thumbnails/Stormweaver.png",
      classColor: cyan[4],
    },
    Witchhunter: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Witchhunter.png",
      image: "/assets/poe2/ascendancies/thumbnails/Witchhunter.png",
      classColor: orange[7],
    },
    "Gemling Legionnaire": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Gemling_Legionnaire.png",
      image: "/assets/poe2/ascendancies/thumbnails/Gemling_Legionnaire.png",
      classColor: orange[4],
    },
    Invoker: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Invoker.png",
      image: "/assets/poe2/ascendancies/thumbnails/Invoker.png",
      classColor: purple[7],
    },
    "Acolyte of Chayula": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Acolyte_of_Chayula.png",
      image: "/assets/poe2/ascendancies/thumbnails/Acolyte_of_Chayula.png",
      classColor: purple[4],
    },
    Deadeye: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Deadeye.png",
      image: "/assets/poe2/ascendancies/thumbnails/Deadeye.png",
      classColor: green[7],
    },
    Pathfinder: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Pathfinder.png",
      image: "/assets/poe2/ascendancies/thumbnails/Pathfinder.png",
      classColor: green[4],
    },
    "Blood Mage": {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Blood_Mage.png",
      image: "/assets/poe2/ascendancies/thumbnails/Blood_Mage.png",
      classColor: blue[7],
    },
    Infernalist: {
      thumbnail: "/assets/poe2/ascendancies/thumbnails/Infernalist.png",
      image: "/assets/poe2/ascendancies/thumbnails/Infernalist.png",
      classColor: blue[4],
    },
  },
  [GameVersion.poe1]: {
    Ascendant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Ascendant.png",
      image: "/assets/poe1/ascendancies/thumbnails/Ascendant.png",
      classColor: "white",
    },
    Assassin: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Assassin.png",
      image: "/assets/poe1/ascendancies/thumbnails/Assassin.png",
      classColor: cyan[7],
    },
    Saboteur: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Saboteur.png",
      image: "/assets/poe1/ascendancies/thumbnails/Saboteur.png",
      classColor: cyan[5],
    },
    Trickster: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Trickster.png",
      image: "/assets/poe1/ascendancies/thumbnails/Trickster.png",
      classColor: cyan[4],
    },
    Berserker: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Berserker.png",
      image: "/assets/poe1/ascendancies/thumbnails/Berserker.png",
      classColor: red[7],
    },
    Chieftain: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Chieftain.png",
      image: "/assets/poe1/ascendancies/thumbnails/Chieftain.png",
      classColor: red[4],
    },
    Juggernaut: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Juggernaut.png",
      image: "/assets/poe1/ascendancies/thumbnails/Juggernaut.png",
      classColor: red[5],
    },
    Champion: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Champion.png",
      image: "/assets/poe1/ascendancies/thumbnails/Champion.png",
      classColor: orange[7],
    },
    Gladiator: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Gladiator.png",
      image: "/assets/poe1/ascendancies/thumbnails/Gladiator.png",
      classColor: orange[4],
    },
    Slayer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Slayer.png",
      image: "/assets/poe1/ascendancies/thumbnails/Slayer.png",
      classColor: orange[5],
    },
    Deadeye: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Deadeye.png",
      image: "/assets/poe1/ascendancies/thumbnails/Deadeye.png",
      classColor: green[7],
    },
    Pathfinder: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Pathfinder.png",
      image: "/assets/poe1/ascendancies/thumbnails/Pathfinder.png",
      classColor: green[4],
    },
    Warden: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      classColor: green[5],
    },
    Raider: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      image: "/assets/poe1/ascendancies/thumbnails/Warden.png",
      classColor: green[5],
    },
    Elementalist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Elementalist.png",
      image: "/assets/poe1/ascendancies/thumbnails/Elementalist.png",
      classColor: blue[7],
    },
    Necromancer: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Necromancer.png",
      image: "/assets/poe1/ascendancies/thumbnails/Necromancer.png",
      classColor: blue[4],
    },
    Occultist: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Occultist.png",
      image: "/assets/poe1/ascendancies/thumbnails/Occultist.png",
      classColor: blue[5],
    },
    Guardian: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Guardian.png",
      image: "/assets/poe1/ascendancies/thumbnails/Guardian.png",
      classColor: purple[7],
    },
    Hierophant: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Hierophant.png",
      image: "/assets/poe1/ascendancies/thumbnails/Hierophant.png",
      classColor: purple[4],
    },
    Inquisitor: {
      thumbnail: "/assets/poe1/ascendancies/thumbnails/Inquisitor.png",
      image: "/assets/poe1/ascendancies/thumbnails/Inquisitor.png",
      classColor: purple[5],
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
