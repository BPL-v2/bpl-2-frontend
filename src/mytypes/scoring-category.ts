export function getRootCategoryNames(gameVersion: "poe1" | "poe2"): string[] {
  if (gameVersion === "poe1") {
    return [
      // "Personal Objectives",
      "Uniques",
      "Races",
      "Bounties",
      "Collections",
      "Dailies",
      "Heist",
      "Gems",
      "Delve",
    ];
  }
  return [
    "Personal Objectives",
    "Uniques",
    "Races",
    "Bounties",
    "Collections",
    "Dailies",
  ];
}
