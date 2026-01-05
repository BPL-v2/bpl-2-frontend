import { useGetEventStatus } from "@client/query";
import { CollectionCard } from "@components/cards/collection-card";
import TeamScoreDisplay from "@components/team/team-score";
import { BingoTabRules } from "@rules/bingo";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/scores/bingo")({
  component: RouteComponent,
});
var regex = /(\d+),(\d+)/;
function RouteComponent() {
  const { rules } = Route.useSearch();
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const [selectedTeam, setSelectedTeam] = useState<number>();
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const category = scores?.children.find((cat) => cat.name === "Bingo");
  if (!category || !currentEvent) {
    return <></>;
  }
  const gridSize = Math.sqrt(category.children.length);
  useEffect(() => {
    if (eventStatus && eventStatus.team_id) {
      setSelectedTeam(eventStatus.team_id);
    } else if (
      currentEvent &&
      currentEvent.teams &&
      currentEvent.teams.length > 0
    ) {
      setSelectedTeam(currentEvent.teams[0].id);
    }
  }, [eventStatus, currentEvent]);

  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <BingoTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay
          objective={category}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: gridSize })
            .map((_, colIdx) =>
              Array.from({ length: gridSize }).map((_, rowIdx) => {
                const child = category.children.find((c) => {
                  const match = c.extra?.match(regex);
                  if (match) {
                    const row = parseInt(match[1], 10);
                    const col = parseInt(match[2], 10);
                    return row === rowIdx && col === colIdx;
                  }
                  return false;
                });
                if (child) {
                  return (
                    <div
                      className={twMerge(
                        child.team_score[selectedTeam || 0]?.finished &&
                          "bg-success outline-8 outline-success",
                      )}
                    >
                      <CollectionCard
                        key={child.id}
                        objective={child}
                        ignoreExtra
                        className="h-full w-full"
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={`${rowIdx},${colIdx}`}
                    className="flex items-center justify-center rounded-box border-2 border-base-300 bg-base-200 p-2"
                  >
                    {rowIdx + 1},{colIdx + 1}
                  </div>
                );
              }),
            )
            .flat()}
          {/* {category.children
        .sort((a, b) => {
          const aMatch = a.extra?.match(regex);
          const bMatch = b.extra?.match(regex);
          if (aMatch && bMatch) {
            const aRow = parseInt(aMatch[1], 10);
            const aCol = parseInt(aMatch[2], 10);
            const bRow = parseInt(bMatch[1], 10);
            const bCol = parseInt(bMatch[2], 10);
            if (aRow === bRow) {
              return aCol - bCol;
            }
            return aRow - bRow;
          }
          return 0;
        })
        .map((c) => (
          <div key={c.id} className="rounded-box border-3 border-red-500">
            <CollectionCard
              key={c.id}
              objective={c}
              ignoreExtra
              className="h-full w-full"
            />
          </div>
        ))} */}
        </div>
      </div>
    </>
  );
}
