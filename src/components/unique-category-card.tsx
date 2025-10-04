import { Medal } from "@icons/medal";
import { ScoreObjective } from "@mytypes/score";
import { getPotentialPoints, getTotalPoints } from "@utils/utils";
import { twMerge } from "tailwind-merge";
import { CategoryIcon } from "../icons/category-icons";

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
}: UniqueCategoryCardProps) => {
  const totalItems = objective.children.length;
  const totalVariants = objective.children.reduce(
    (acc, variantCategory) => acc + variantCategory.children.length,
    0,
  );
  const numItems = objective.team_score[teamId]?.number || 0;
  const numVariants = teamId
    ? objective.children.reduce((acc, subCategory) => {
        return (
          acc +
          subCategory.children.reduce((numVariants, child) => {
            if (child.team_score[teamId]?.finished) {
              return numVariants + 1;
            }
            return numVariants;
          }, 0)
        );
      }, 0)
    : 0;

  const points = teamId
    ? `${getTotalPoints(objective)[teamId]} / ${
        getPotentialPoints(objective)[teamId]
      }`
    : null;

  return (
    <div
      className={twMerge(
        "card cursor-pointer bborder border-highlight bg-gradient-to-t shadow-xl hover:text-highlight-content",
        selected
          ? "from-base-200 to-highlight text-highlight-content ring-3 ring-primary"
          : "from-base-100 to-base-300",
      )}
      key={`unique-card-${objective.id}`}
      onClick={onClick}
    >
      <div
        className={twMerge(
          "m-0 card-title flex h-full min-h-4 items-center justify-center rounded-t-box bborder-b bg-base-300/50 p-2 sm:justify-between",
          selected ? "border-0 bg-highlight" : "",
        )}
      >
        <div className="flex-shrink-0">
          <Medal rank={objective.team_score[teamId]?.rank} size={28} />
        </div>
        <div>
          <h1 className="font-extrabold">{objective.name}</h1>
          <h1 className="font-bold text-info">{objective.extra}</h1>
        </div>
        <div className="hidden flex-shrink-0 text-sm sm:block"> {points} </div>
      </div>
      <div className="min-h-2 px-4">
        <div>
          <div className="stat px-0 pt-2 pb-0">
            <div
              className={twMerge(
                "stat-value text-4xl",
                numItems === totalItems ? "text-success" : "text-error",
              )}
            >
              {numItems} / {totalItems}
            </div>
            {totalVariants ? (
              <div
                className={twMerge(
                  "stat-desc text-lg font-bold",
                  numVariants === totalVariants ? "text-success" : "text-error",
                )}
              >
                {`Variants: ${numVariants} / ${totalVariants}`}
              </div>
            ) : null}
            <div className="col-start-2 row-span-2 row-start-1 hidden self-center justify-self-end select-none sm:block">
              <CategoryIcon name={objective.name} />
            </div>
          </div>
        </div>
        <div className="select-none">
          <progress
            className={twMerge(
              "progress my-2",
              numItems === totalItems ? "progress-success" : "progress-error",
            )}
            value={numItems / totalItems}
            max="1"
          ></progress>
        </div>
      </div>
    </div>
  );
};
