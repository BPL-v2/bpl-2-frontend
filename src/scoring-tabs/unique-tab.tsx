import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import TeamScore from "../components/team-score";
import { getSubCategory } from "../types/scoring-category";
import { ItemTable } from "../components/item-table";
import { ScoreCategory } from "../types/score";
import { UniqueCategoryCard } from "../components/unique-category-card";

const UniqueTab: React.FC = () => {
  const { currentEvent, eventStatus, scores } = useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  const tableRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: ScoreCategory) => {
    setSelectedCategory(category);
    if (!tableRef.current) {
      return;
    }
    tableRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (eventStatus && eventStatus.team_id) {
      setSelectedTeam(eventStatus.team_id);
    } else if (currentEvent && currentEvent.teams.length > 0) {
      setSelectedTeam(currentEvent.teams[0].id);
    }
  }, [eventStatus, currentEvent]);
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
          return (
            <div key={`unique-category-${category.id}`}>
              <UniqueCategoryCard
                category={category}
                selected={category.id === selectedCategory?.id}
                teamId={selectedTeam}
                onClick={() => handleCategoryClick(category)}
              />
            </div>
          );
        })}
      </div>
      <div ref={tableRef} className="divider divider-primary">
        {"Items"}
      </div>
      {table}
    </>
  );
};

export default UniqueTab;
