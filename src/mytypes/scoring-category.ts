export function getRootCategoryNames(gameVersion: "poe1" | "poe2"): string[] {
  if (gameVersion === "poe1") {
    return [
      "Uniques",
      "Focus Uniques",
      "Bounties",
      "Collections",
      "Dailies",
      "Heist",
      "Scarabs",
    ];
    // return [
    //   "Personal Objectives",
    //   "Uniques",
    //   "Races",
    //   "Bounties",
    //   "Collections",
    //   "Dailies",
    //   "Heist",
    //   "Gems",
    //   "Delve",
    // ];
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
