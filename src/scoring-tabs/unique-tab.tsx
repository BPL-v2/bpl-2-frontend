import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import TeamScore from "../components/team-score";
import { getSubCategory } from "../types/scoring-category";
import { getPotentialPoints, getTotalPoints } from "../utils/utils";
import { ItemTable } from "../components/item-table";
import { ScoreCategory } from "../types/score";

const UniqueTab: React.FC = () => {
  const { currentEvent, eventStatus, scores, gameVersion } =
    useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  useEffect(() => {
    if (eventStatus) {
      setSelectedTeam(eventStatus.team_id);
    }
  }, [eventStatus]);
  const uniqueCategory = getSubCategory(scores, "Uniques");
  const table = useMemo(() => {
    if (!selectedCategory) {
      return <></>;
    }
    return <ItemTable category={selectedCategory}></ItemTable>;
  }, [selectedCategory, selectedTeam, uniqueCategory]);

  if (!uniqueCategory || !currentEvent || !scores || !selectedTeam) {
    return <></>;
  }

  return (
    <>
      <TeamScore
        category={uniqueCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      <div className="divider divider-primary">{"Categories"}</div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {uniqueCategory.sub_categories.map((category) => {
          const totalItems = category.objectives.length;
          const totalVariants = category.sub_categories.reduce(
            (acc, subCategory) => acc + subCategory.objectives.length,
            0
          );
          const numItems = selectedTeam
            ? category.team_score[selectedTeam].number
            : 0;
          const numVariants = selectedTeam
            ? category.sub_categories.reduce(
                (acc, subCategory) =>
                  acc + subCategory.team_score[selectedTeam].number,
                0
              )
            : 0;
          const bgColor =
            selectedCategory?.id === category.id
              ? "bg-highlight"
              : "bg-base-300 hover:border-primary  ";
          const headerColor =
            selectedCategory?.id === category.id
              ? "bg-base-300"
              : "bg-base-200";
          const borderColor =
            selectedCategory?.id === category.id
              ? "border-primary"
              : "border-base-100";
          const points = selectedTeam
            ? `${getTotalPoints(category)[selectedTeam]} / ${
                getPotentialPoints(category)[selectedTeam]
              }`
            : null;
          let placementIcon: string = "";
          if (category.team_score[selectedTeam].rank === 1) {
            placementIcon = "/assets/misc/medal-gold.svg";
          } else if (category.team_score[selectedTeam].rank === 2) {
            placementIcon = "/assets/misc/medal-silver.svg";
          } else if (category.team_score[selectedTeam].rank >= 3) {
            placementIcon = "/assets/misc/medal-bronze.svg";
          }

          return (
            <div
              className={`card border-4 rounded-none  ${bgColor} ${borderColor} border-2 cursor-pointer`}
              key={category.id}
              onClick={() => setSelectedCategory(category)}
            >
              <div
                className={`card-title m-0 p-4 flex items-center justify-between ${headerColor} `}
              >
                <div className="flex-shrink-0">
                  {placementIcon ? (
                    <img
                      className="flex-shrink-0 w-8 h-8"
                      src={placementIcon}
                    />
                  ) : null}
                </div>
                <h1 className="text-2xl text-center">{category.name}</h1>
                <div className="flex-shrink-0"> {points} </div>
              </div>
              <div className="px-4">
                <div>
                  <div className="stat pt-4 px-0 pb-0">
                    <div
                      className={`stat-value text-4xl ${
                        numItems === totalItems
                          ? "text-success"
                          : "text-primary"
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
                    <div className="stat-figure">
                      <img
                        className="w-20 h-20 m-2"
                        src={`/assets/${gameVersion}/icons/${category.name}.svg`}
                      />
                    </div>
                  </div>
                </div>
                <progress
                  className={`progress my-2  ${
                    numItems === totalItems
                      ? "progress-success"
                      : "progress-primary"
                  }`}
                  value={numItems / totalItems}
                  max="1"
                ></progress>
              </div>
            </div>
          );
        })}
      </div>
      <div className="divider divider-primary">{"Items"}</div>
      {table}
    </>
  );
};

export default UniqueTab;
