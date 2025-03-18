import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import TeamScore from "../components/team-score";
import { ItemTable } from "../components/item-table";
import { isFinished, isWinnable, ScoreCategory } from "../types/score";
import { UniqueCategoryCard } from "../components/unique-category-card";

const UniqueTab: React.FC = () => {
  const { currentEvent, eventStatus, scores } = useContext(GlobalStateContext);
  const [uniqueCategory, setUniqueCategory] = useState<ScoreCategory>();
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFinished, setShowFinished] = useState<boolean>(true);
  const [showUncontested, setShowWinnable] = useState<boolean>(true);
  const [shownCategories, setShownCategories] = useState<ScoreCategory[]>([]);
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
    } else if (
      currentEvent &&
      currentEvent.teams &&
      currentEvent.teams.length > 0
    ) {
      setSelectedTeam(currentEvent.teams[0].id);
    }
  }, [eventStatus, currentEvent]);

  useEffect(() => {
    if (!scores) {
      return;
    }
    const uniques = scores.sub_categories.find(
      (category) => category.name === "Uniques"
    );
    if (!uniques) {
      return;
    }
    setUniqueCategory(uniques);
    if (!selectedCategory) {
      return;
    }
    setSelectedCategory(
      uniques.sub_categories.find(
        (category) => category.id === selectedCategory.id
      )
    );
  }, [scores]);

  useEffect(() => {
    if (!uniqueCategory || !selectedTeam) {
      return;
    }
    const shownCategories = uniqueCategory.sub_categories.filter(
      (category) =>
        category.name.toLowerCase().includes(categoryFilter.toLowerCase()) &&
        (showFinished || !isFinished(category, selectedTeam)) &&
        (showUncontested || isWinnable(category))
    );
    if (shownCategories.length === 1) {
      setSelectedCategory(shownCategories[0]);
    }
    setShownCategories(shownCategories);
  }, [
    uniqueCategory,
    categoryFilter,
    showFinished,
    showUncontested,
    selectedTeam,
  ]);

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
      <div className="flex justify-center">
        <fieldset className="fieldset w-xl bg-base-300 p-4 pt-4 rounded-box flex gap-12 flex-row justify-center m-2">
          <div>
            <legend className="fieldset-legend">Category</legend>
            <input
              type="search"
              className="input input-sm "
              placeholder=""
              onInput={(e) => setCategoryFilter(e.currentTarget.value)}
            />
          </div>
          <div>
            <legend className="fieldset-legend ">Show finished</legend>
            <label className="fieldset-label">
              <input
                type="checkbox"
                checked={showFinished}
                className="toggle toggle-lg"
                onChange={(e) => setShowFinished(e.target.checked)}
              />
            </label>
          </div>
          <div>
            <legend className="fieldset-legend">
              Show 1st place unavailable
            </legend>
            <label className="fieldset-label">
              <input
                type="checkbox"
                checked={showUncontested}
                className="toggle toggle-lg"
                onChange={(e) => {
                  setShowWinnable(e.target.checked);
                }}
              />
            </label>
          </div>
        </fieldset>
      </div>
      <div className="divider divider-primary">Categories</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 m-2">
        {shownCategories.map((category) => {
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
        Items
      </div>
      {table}
    </>
  );
};

export default UniqueTab;
