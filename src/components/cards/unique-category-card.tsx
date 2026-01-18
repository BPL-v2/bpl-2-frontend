import { ScoringMethod } from "@client/api";
import { CategoryIcon } from "@icons/category-icons";
import { Medal } from "@icons/medal";
import { ScoreObjective } from "@mytypes/score";
import { renderScore } from "@utils/score";
import { getPotentialPoints, getTotalPoints, isFinished } from "@utils/utils";
import { twMerge } from "tailwind-merge";

type UniqueCategoryCardProps = {
  objective: ScoreObjective;
  selected: boolean;
  teamId?: number;
  onClick: () => void;
};

export const UniqueCategoryCard = ({
  objective,
  selected,
  teamId = 0,
  onClick,
  ...props
}: UniqueCategoryCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  const totalItems = objective.children.length;
  const totalVariants = objective.children.reduce(
    (acc, variantCategory) => acc + variantCategory.children.length,
    0,
  );
  const numItems = objective.team_score[teamId]?.completions[0]?.number || 0;
  const numVariants = teamId
    ? objective.children.reduce((acc, subCategory) => {
        return (
          acc +
          subCategory.children.reduce((numVariants, child) => {
            if (isFinished(child.team_score[teamId])) {
              return numVariants + 1;
            }
            return numVariants;
          }, 0)
        );
      }, 0)
    : 0;

  const canBeFinished =
    objective.scoring_presets[0]?.scoring_method !==
    ScoringMethod.CHILD_NUMBER_SUM;
  return (
    <div className="h-full">
      <div
        {...props}
        className={twMerge(
          "card h-full cursor-pointer bborder shadow-xl",
          selected
            ? "bg-card-highlight text-highlight-content ring-3 ring-primary"
            : "bg-card hover:bg-card-highlight hover:text-highlight-content",
          props?.className,
        )}
        key={`unique-card-${objective.id}`}
        onClick={onClick}
      >
        <div
          className={twMerge(
            "m-0 card-title flex min-h-4 items-center justify-center rounded-t-box bborder-b bg-base-300/50 p-2 sm:justify-between",
            selected ? "border-0" : "",
          )}
        >
          <div className="shrink-0">
            <Medal
              rank={objective.team_score[teamId]?.completions[0]?.rank}
              size={28}
            />
          </div>
          <div>
            <h1 className="font-extrabold">{objective.name}</h1>
            <h1 className="font-bold text-info">{objective.extra}</h1>
          </div>
          <div className="hidden shrink-0 text-sm sm:block">
            {renderScore(
              getTotalPoints(objective)[teamId],
              getPotentialPoints(objective)[teamId],
            )}
          </div>
        </div>
        <div className="flex h-full min-h-2 flex-col justify-between px-4">
          <div className="h-full">
            <div className="flex h-full flex-row items-start justify-between p-0 pt-2">
              <div className="flex w-full flex-col">
                <div
                  className={twMerge(
                    "text-4xl font-extrabold",
                    numItems === totalItems ? "text-success" : "text-error",
                    !canBeFinished && "text-base-content",
                  )}
                >
                  {canBeFinished ? `${numItems} / ${totalItems}` : numItems}
                </div>
                {totalVariants ? (
                  <div
                    className={twMerge(
                      "text-lg font-bold",
                      numVariants === totalVariants
                        ? "text-success"
                        : "text-error",
                    )}
                  >
                    {`Variants: ${numVariants} / ${totalVariants}`}
                  </div>
                ) : null}
              </div>
              <div className="hidden self-center sm:block">
                <CategoryIcon name={objective.name} />
              </div>
            </div>
          </div>
          {canBeFinished && (
            <progress
              className={twMerge(
                "progress my-2 select-none",
                numItems === totalItems ? "progress-success" : "progress-error",
              )}
              value={numItems / totalItems}
              max="1"
            ></progress>
          )}
        </div>
      </div>
    </div>
  );
};
