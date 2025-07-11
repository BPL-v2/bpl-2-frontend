import { LadderEntry } from "@client/api";

export function calcPersonalPoints(ladderEntry: LadderEntry) {
  let points = 0;
  if (ladderEntry.level >= 80) {
    points += 3;
  }
  if (ladderEntry.level >= 90) {
    points += 3;
  }
  if (ladderEntry.character) {
    if (ladderEntry.character.atlas_node_count >= 40) {
      points += 3;
    }
    if (ladderEntry.character.ascendancy_points >= 8) {
      points += 3;
    }
  }
  return Math.min(points, 9);
}
