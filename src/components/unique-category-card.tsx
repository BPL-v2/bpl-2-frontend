import { Medal } from "@icons/medal";
import { ScoreObjective } from "@mytypes/score";
import { getPotentialPoints, getTotalPoints } from "@utils/utils";
import { twMerge } from "tailwind-merge";
import { CategoryIcon } from "../icons/category-icons";

type UniqueCategoryCardProps = {
  objective: ScoreObjective;
  selected: boolean;
  teamId: number;
  onClick: () => void;
};

export const UniqueCategoryCard = ({
  objective,
  selected,
  teamId,
  onClick,
}: UniqueCategoryCardProps) => {
  const totalItems = objective.children.length;
  const totalVariants = objective.children.reduce(
    (acc, variantCategory) => acc + variantCategory.children.length,
    0
  );
  const numItems =objective.team_score[teamId]?.number ||0;
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
        "card cursor-pointer bborder",
        selected
          ? "bg-highlight text-highlight-content ring-3 ring-primary"
          : "bg-base-300 hover:bg-highlight hover:text-highlight-content transition duration-200"
      )}
      key={`unique-card-${objective.id}`}
      onClick={onClick}
    >
      <div
        className={twMerge(
          "card-title rounded-t-box m-0 p-2 flex items-center justify-center sm:justify-between bborder-b min-h-4 h-full",
          selected ? "bg-base-300" : "bg-base-200"
        )}
      >
        <div className="flex-shrink-0">
          <Medal rank={objective.team_score[teamId]?.rank} size={28} />
        </div>
        <h1 className="font-extrabold">{objective.name}</h1>
        <div className="hidden sm:block flex-shrink-0 text-sm"> {points} </div>
      </div>
      <div className="px-4 min-h-2">
        <div>
          <div className="stat pt-2 px-0 pb-0">
            <div
              className={twMerge(
                "stat-value text-4xl",
                numItems === totalItems ? "text-success" : "text-error"
              )}
            >
              {numItems} / {totalItems}
            </div>
            {totalVariants ? (
              <div
                className={twMerge(
                  "stat-desc text-lg font-bold",
                  numVariants === totalVariants ? "text-success" : "text-error"
                )}
              >
                {`Variants: ${numVariants} / ${totalVariants}`}
              </div>
            ) : null}
            <div className="hidden sm:block col-start-2 row-span-2 row-start-1 self-center justify-self-end select-none">
              <CategoryIcon name={objective.name} />
            </div>
          </div>
        </div>
        <div className="select-none">
          <progress
            className={twMerge(
              "progress my-2",
              numItems === totalItems ? "progress-success" : "progress-error"
            )}
            value={numItems / totalItems}
            max="1"
          ></progress>
        </div>
      </div>
    </div>
  );
};
