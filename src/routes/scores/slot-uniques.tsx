import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { Uniques } from "@components/pages/uniques";
import { SlotUniqueTabRules } from "../../rules-alt/slot-uniques";

export const Route = createFileRoute("/scores/slot-uniques")({
  component: SlotUniqueTab,
});

function SlotUniqueTab(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <Uniques
      rules={rules ? <SlotUniqueTabRules /> : undefined}
      categoryName="Slot Uniques"
    />
  );
}
