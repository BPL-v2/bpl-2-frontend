import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { Uniques } from "@components/pages/uniques";
import { FocusUniqueTabRules } from "../../rules-alt/focus-uniques";

export const Route = createFileRoute("/scores/focus-uniques")({
  component: FocusUniqueTab,
});

function FocusUniqueTab(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <Uniques
      rules={rules ? <FocusUniqueTabRules /> : undefined}
      categoryName="Focus Uniques"
    />
  );
}
