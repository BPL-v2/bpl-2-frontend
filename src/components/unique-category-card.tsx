import { useContext } from "react";
import { ScoreCategory } from "../types/score";
import { getPotentialPoints, getTotalPoints } from "../utils/utils";
import { GlobalStateContext } from "../utils/context-provider";
import { Medal } from "./medal";

type UniqueCategoryCardProps = {
  category: ScoreCategory;
  selected: boolean;
  teamId: number;
  onClick: () => void;
};

export const UniqueCategoryCard = ({
  category,
  selected,
  teamId,
  onClick,
}: UniqueCategoryCardProps) => {
  const { gameVersion } = useContext(GlobalStateContext);
  const totalItems = category.objectives.length;
  const totalVariants = category.sub_categories.reduce(
    (acc, subCategory) => acc + subCategory.objectives.length,
    0
  );
  const numItems = teamId ? category.team_score[teamId].number : 0;
  const numVariants = teamId
    ? category.sub_categories.reduce(
        (acc, subCategory) => acc + subCategory.team_score[teamId].number,
        0
      )
    : 0;
  const bgColor = selected ? "bg-highlight" : "bg-base-300";
  const headerColor = selected ? "bg-base-300" : "bg-base-200";
  const borderColor = selected
    ? "border-primary"
    : "border-base-300 hover:border-secondary hover:border-dotted";
  const points = teamId
    ? `${getTotalPoints(category)[teamId]} / ${
        getPotentialPoints(category)[teamId]
      }`
    : null;

  return (
    <div
      className={`card border-3 cursor-pointer ${bgColor} ${borderColor}`}
      key={`unique-card-${category.id}`}
      onClick={onClick}
    >
      <div
        className={`card-title top-box-rounded m-0 p-2 flex items-center justify-between ${headerColor}`}
      >
        <div className="flex-shrink-0">
          <Medal rank={category.team_score[teamId].rank} size={28} />
        </div>
        <h1 className="text-xl text-center">{category.name}</h1>
        <div className="flex-shrink-0 text-sm"> {points} </div>
      </div>
      <div className="px-4">
        <div>
          <div className="stat pt-2 px-0 pb-0">
            <div
              className={`stat-value text-4xl ${
                numItems === totalItems ? "text-success" : "text-error"
              }`}
            >
              {numItems} / {totalItems}
            </div>
            {totalVariants ? (
              <div
                className={`stat-desc text-lg font-bold ${
                  numVariants === totalVariants ? "text-success" : "text-error"
                }`}
              >
                {`Variants: ${numVariants} / ${totalVariants}`}
              </div>
            ) : null}
            <div className="col-start-2 row-span-2 row-start-1 self-center justify-self-end select-none">
              <img
                className="size-16 m-2"
                src={`/assets/${gameVersion}/icons/${category.name}.svg`}
              />
            </div>
          </div>
        </div>
        <div className="select-none">
          <progress
            className={`progress my-2  ${
              numItems === totalItems ? "progress-success" : "progress-error"
            }`}
            value={numItems / totalItems}
            max="1"
          ></progress>
        </div>
      </div>
    </div>
  );
};
