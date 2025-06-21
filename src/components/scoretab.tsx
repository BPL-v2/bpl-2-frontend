import React from "react";

type ScoreTabProps = {
  tab: () => React.ReactNode;
  rules: () => React.ReactNode;
};

export function ScoreTab({ tab, rules }: ScoreTabProps) {
  return (
    <>
      <article className="prose text-left max-w-4xl my-4 bg-base-200 p-8 rounded-box">
        {rules()}
      </article>
      {tab()}
    </>
  );
}
