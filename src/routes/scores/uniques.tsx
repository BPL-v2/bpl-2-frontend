import { useGetEventStatus } from "@client/query";
import { ItemTable } from "@components/table/item-table";
import TeamScoreDisplay from "@components/team/team-score";
import { UniqueCategoryCard } from "@components/cards/unique-category-card";
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
  const [selectedTeam, setSelectedTeam] = useState<number>();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [itemFilter, setItemfilter] = useState<string>("");
  const [shownCategories, setShownCategories] = useState<ScoreObjective[]>([]);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const tableRef = useRef<HTMLDivElement>(null);
  const { rules } = Route.useSearch();
  const uniqueCategory = scores?.children.find(
    (category) => category.name === "Uniques",
  );
  const focusUniqueCategory = scores?.children.find(
    (category) => category.name === "Focus Uniques",
  );
  const handleCategoryClick = (objective: ScoreObjective) => {
    if (objective.id === selectedCategory?.id) {
      setSelectedCategory(undefined);
      return;
    }
    setSelectedCategory(objective);
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!uniqueCategory) {
      return;
    }
    const shownCategories = uniqueCategory.children
      .filter((category) => {
        return (
          category.name.toLowerCase().includes(categoryFilter.toLowerCase()) &&
          category.children.some((item) =>
            item.name.toLowerCase().includes(itemFilter.toLowerCase().trim()),
          ) &&
          (preferences.uniqueSets.showCompleted ||
            !isFinished(category, selectedTeam)) &&
          (preferences.uniqueSets.showFirstAvailable || isWinnable(category))
        );
      })
      .map((category) => {
        return {
          ...category,
          children: category.children.filter((item) => {
            return item.name
              .toLowerCase()
              .includes(itemFilter.toLowerCase().trim());
          }),
        };
      });
    if (
      (itemFilter && shownCategories.length > 1) ||
      shownCategories.length === 0
    ) {
      setSelectedCategory(undefined);
    } else if (shownCategories.length === 1) {
      setSelectedCategory(shownCategories[0]);
    }
    setShownCategories(shownCategories);
  }, [uniqueCategory, categoryFilter, itemFilter, preferences, selectedTeam]);

  const table = useMemo(() => {
    if (!uniqueCategory) {
      return <></>;
    }
    if (!selectedCategory) {
      const cat = { ...uniqueCategory, children: [] } as ScoreObjective;
      for (const child of shownCategories) {
        for (const grandChild of child.children) {
          cat.children.push(grandChild);
        }
      }
      return <ItemTable objective={cat} />;
    }

    return <ItemTable objective={selectedCategory}></ItemTable>;
  }, [selectedCategory, uniqueCategory, shownCategories]);

  if (!uniqueCategory) {
    return <></>;
  }
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <UniqueTabRules />
          </article>
        </div>
      ) : null}
      <TeamScoreDisplay
        objective={uniqueCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex justify-center">
          <fieldset className="fieldset flex w-3xl flex-row justify-center gap-12 rounded-box bg-base-200 p-2 md:p-4">
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
              <legend className="fieldset-legend">Item Search</legend>
              <label className="fieldset-label">
                <input
                  type="search"
                  className="input input-sm"
                  placeholder=""
                  value={itemFilter}
                  onPaste={(e) => {
                    const paste = e.clipboardData.getData("text");
                    if (paste.split("\n").length > 2) {
                      setItemfilter(paste.split("\n")[2]);
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setItemfilter(e.target.value);
                  }}
                />
              </label>
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
        {focusUniqueCategory && (
          <div className="flex flex-col gap-4 rounded-box bg-base-200 p-8 pt-4">
            <h1 className="text-3xl font-extrabold">Focus Unique Sets</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {focusUniqueCategory?.children
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => {
                  return (
                    <div
                      key={`focus-unique-category-${category.id}`}
                      className="h-full"
                    >
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
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-8 pt-4">
          <h1 className="text-3xl font-extrabold">Unique Sets</h1>
          <div className="m-2 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
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
        </div>
        <div
          ref={tableRef}
          className="divider divider-primary text-xl font-extrabold"
        >
          {(selectedCategory ? selectedCategory.name : "All") + " Items"}
        </div>
        {table}
      </div>
    </>
  );
}
