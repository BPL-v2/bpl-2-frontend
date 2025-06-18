import { DisplayItem, Item } from "@client/api";

export function getColor(item: Item | DisplayItem): string {
  switch (item.rarity) {
    case "Unique":
      return "#B66216";
    case "Rare":
      return "#FDFD77";
    case "Magic":
      return "#7C7CEA";
    case "Normal":
      return "#ADADAD";
    default:
      return "#ADADAD";
  }
}
