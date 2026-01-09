import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { Uniques } from "@components/pages/uniques";
import { UniqueTabRules } from "@rules/uniques";

export const Route = createFileRoute("/scores/uniques")({
  component: UniqueTab,
});

function UniqueTab(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <Uniques
      rules={rules ? <UniqueTabRules /> : undefined}
      categoryName="Uniques"
    />
  );
}
