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
  const bgColor = selected
    ? "bg-highlight"
    : "bg-base-300 hover:border-secondary  ";
  const headerColor = selected ? "bg-base-300" : "bg-base-200";
  const borderColor = selected ? "border-primary" : "border-base-100";
  const points = teamId
    ? `${getTotalPoints(category)[teamId]} / ${
        getPotentialPoints(category)[teamId]
      }`
    : null;
  return (
    <div
      className={`card border-4  cursor-pointer ${bgColor} ${borderColor}`}
      key={`unique-card-${category.id}`}
      onClick={onClick}
    >
      <div
        className={`card-title top-box-rounded m-0 p-4 flex items-center justify-between ${headerColor}`}
      >
        <div className="flex-shrink-0">
          <Medal rank={category.team_score[teamId].rank} size={32} />
        </div>
        <h1 className="text-2xl text-center">{category.name}</h1>
        <div className="flex-shrink-0"> {points} </div>
      </div>
      <div className="px-4">
        <div>
          <div className="stat pt-4 px-0 pb-0">
            <div
              className={`stat-value text-4xl ${
                numItems === totalItems ? "text-success" : "text-primary"
              }`}
            >
              {numItems} / {totalItems}
            </div>
            {totalVariants ? (
              <div
                className={`stat-desc text-lg ${
                  numVariants === totalVariants
                    ? "text-success"
                    : "text-primary"
                }`}
              >
                {`Variants: ${numVariants} / ${totalVariants}`}
              </div>
            ) : null}
            <div className="col-start-2 row-span-2 row-start-1 self-center justify-self-end">
              <img
                className="w-20 h-20 m-2"
                src={`/assets/${gameVersion}/icons/${category.name}.svg`}
              />
            </div>
          </div>
        </div>
        <progress
          className={`progress my-2  ${
            numItems === totalItems ? "progress-success" : "progress-primary"
          }`}
          value={numItems / totalItems}
          max="1"
        ></progress>
      </div>
    </div>
  );
};
