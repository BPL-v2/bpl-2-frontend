import { lazy } from "react";

// This lazy component will load both the CharacterChart and uplot CSS only when needed
export const LazyCharacterChart = lazy(async () => {
  // Import CSS dynamically
  await import("uplot/dist/uPlot.min.css");

  // Import the component
  const { CharacterChart } = await import(
    "@components/profile/character-chart"
  );

  return {
    default: CharacterChart,
  };
});
