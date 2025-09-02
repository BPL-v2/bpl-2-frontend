import { useGetEventStatus } from "@client/query";
import { ItemTable } from "@components/item-table";
import TeamScoreDisplay from "@components/team-score";
import { UniqueCategoryCard } from "@components/unique-category-card";
import { isFinished, isWinnable, ScoreObjective } from "@mytypes/score";
import { UniqueTabRules } from "@rules/uniques";
import { createFileRoute } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { JSX, useContext, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/scores/uniques")({
  component: UniqueTab,
});

function UniqueTab(): JSX.Element {
  const { currentEvent, scores, preferences, setPreferences } =
    useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<ScoreObjective>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [shownCategories, setShownCategories] = useState<ScoreObjective[]>([]);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const tableRef = useRef<HTMLDivElement>(null);
  const { rules } = Route.useSearch();
  const handleCategoryClick = (objective: ScoreObjective) => {
    if (objective.id === selectedCategory?.id) {
      setSelectedCategory(undefined);
      return;
    }
    setSelectedCategory(objective);
    if (!tableRef.current) {
      return;
    }
    tableRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const uniqueCategory = scores?.children.find(
    (category) => category.name === "Uniques"
  );
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
    if (!uniqueCategory || !selectedTeam) {
      return;
    }
    const shownCategories = uniqueCategory.children.filter(
      (category) =>
        category.name.toLowerCase().includes(categoryFilter.toLowerCase()) &&
        (preferences.uniqueSets.showCompleted ||
          !isFinished(category, selectedTeam)) &&
        (preferences.uniqueSets.showFirstAvailable || isWinnable(category))
    );
    if (shownCategories.length === 1) {
      setSelectedCategory(shownCategories[0]);
    }
    setShownCategories(shownCategories);
  }, [uniqueCategory, categoryFilter, preferences, selectedTeam]);

  const table = useMemo(() => {
    if (!uniqueCategory) {
      return <></>;
    }
    if (!selectedCategory) {
      const cat = { ...uniqueCategory, children: [] } as ScoreObjective;
      for (const child of uniqueCategory.children) {
        for (const grandChild of child.children) {
          cat.children.push(grandChild);
        }
      }
      return <ItemTable objective={cat} />;
    }
    return <ItemTable objective={selectedCategory}></ItemTable>;
  }, [selectedCategory, uniqueCategory]);
  if (!uniqueCategory) {
    return <></>;
  }

  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <UniqueTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay
          objective={uniqueCategory}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
        <div className="flex justify-center">
          <fieldset className="fieldset w-2xl bg-base-300 p-2 md:p-4 rounded-box flex gap-12 flex-row justify-evenly">
            <div>
              <legend className="fieldset-legend">Category</legend>
              <input
                type="search"
                className="input input-sm"
                placeholder=""
                onInput={(e) => setCategoryFilter(e.currentTarget.value)}
              />
            </div>
            <div>
              <legend className="fieldset-legend">Show finished</legend>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  checked={preferences.uniqueSets.showCompleted}
                  className="toggle toggle-lg"
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      uniqueSets: {
                        ...preferences.uniqueSets,
                        showCompleted: e.target.checked,
                      },
                    })
                  }
                />
              </label>
            </div>
            <div>
              <legend className="fieldset-legend">Show unwinnable</legend>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  checked={preferences.uniqueSets.showFirstAvailable}
                  className="toggle toggle-lg"
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      uniqueSets: {
                        ...preferences.uniqueSets,
                        showFirstAvailable: e.target.checked,
                      },
                    });
                  }}
                />
              </label>
            </div>
          </fieldset>
        </div>
        <div className="divider divider-primary m-0">Categories</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 m-2">
          {shownCategories
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => {
              return (
                <div key={`unique-category-${category.id}`}>
                  <UniqueCategoryCard
                    objective={category}
                    selected={category.id === selectedCategory?.id}
                    teamId={selectedTeam}
                    onClick={() => handleCategoryClick(category)}
                  />
                </div>
              );
            })}
        </div>
        <div ref={tableRef} className="divider divider-primary m-0">
          Items
        </div>
        {table}
      </div>
    </>
  );
}
