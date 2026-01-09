import { useGetEventStatus } from "@client/query";
import { ProgressBar } from "@components/progress-bar";
import TeamScoreDisplay from "@components/team/team-score";
import { BingoTabRules } from "@rules/bingo";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { isFinished } from "@utils/utils";
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
                        isFinished(child.team_score[selectedTeam || 0]) &&
                          "bg-success outline-8 outline-success",
                      )}
                    >
                      {/* <CollectionCard
                        key={child.id}
                        objective={child}
                        ignoreExtra
                        showPoints={false}
                        className="h-full w-full"
                      /> */}
                      <div className="card h-full bg-card">
                        <h2 className="m-0 card-title flex h-full min-h-22 items-center rounded-t-box bborder-b px-4 py-2">
                          {child.required_number.toLocaleString()} {child.name}
                        </h2>
                        <div className="w-full rounded-b-box p-4 px-4">
                          <ProgressBar
                            value={
                              child.team_score[selectedTeam || 0]
                                ?.completions[0]?.number
                            }
                            maxVal={child.required_number}
                            gotPoints={false}
                            className="h-5"
                          />
                        </div>
                      </div>
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
        </div>
      </div>
    </>
  );
}
