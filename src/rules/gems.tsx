import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

import { getPointRules } from "@utils/rules";

export function GemTabRules() {
  const { scores } = useContext(GlobalStateContext);
  return (
    <>
      <h3>Points</h3>
      {scores?.children
        .find((category) => category.name === "Gems")
        ?.children.map((child) => getPointRules(child))}
    </>
  );
}
