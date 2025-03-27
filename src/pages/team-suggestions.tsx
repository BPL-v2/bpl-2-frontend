import { useContext, useEffect, useMemo } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { flattenCategories } from "../types/scoring-category";
import { ScoringMethod, Suggestions, Team } from "../client";
import Table from "../components/table";
import { ColumnDef } from "@tanstack/react-table";
import { ScoreCategory, ScoreObjective } from "../types/score";
import {
  getPotentialPointsForCategory,
  getPotentialPointsForObjective,
} from "../utils/utils";
import React from "react";
import { teamApi } from "../client/client";

export function TeamSuggestionsPage() {
  const { currentEvent, scores, eventStatus } = useContext(GlobalStateContext);
  const [teamGoals, setTeamGoals] = React.useState<Suggestions>({
    category_ids: [],
    objective_ids: [],
  });

  useEffect(() => {
    if (!currentEvent) {
      return;
    }
    teamApi.getTeamSuggestions(currentEvent.id).then(setTeamGoals);
  }, [currentEvent]);

  const categoryColumns = useMemo(() => {
    if (!eventStatus) {
      return [];
    }
    const columns: ColumnDef<ScoreCategory>[] = [
      {
        header: "Name",
        accessorKey: "name",
        size: 200,
      },
      {
        header: "Available Points",
        accessorFn: (category) =>
          getPotentialPointsForCategory(category)[eventStatus.team_id!],
        size: 350,
      },

      {
        header: "Missing",
        accessorFn: (category) => {
          return category.objectives.filter(
            (objective) =>
              eventStatus.team_id !== undefined &&
              !objective.team_score[eventStatus.team_id]?.finished
          ).length;
        },
        cell: (row) => {
          return (
            <div
              className="tooltip tooltip-left w-full h-full cursor-help z-100"
              data-tip={row.row.original.objectives
                .filter(
                  (objective) =>
                    !objective.team_score[eventStatus.team_id!]?.finished
                )
                .map((objective) => objective.name)
                .join(", ")}
            >
              <div>{row.cell.getValue() as string}</div>
            </div>
          );
        },
      },
      {
        header: "Opponent is missing",
        cell: (row) => {
          let num: number = 99999999;
          let nextTeam: Team | undefined;
          for (const team of currentEvent?.teams || []) {
            if (team.id === eventStatus.team_id) {
              continue;
            }
            const missing = row.row.original.objectives.filter(
              (objective) => !objective.team_score[team.id]?.finished
            ).length;
            if (num == undefined || (missing < num && missing > 0)) {
              num = missing;
              nextTeam = team;
            }
          }
          if (num === 99999999) {
            return "Last team to finish";
          }
          return (
            <div
              className="tooltip tooltip-right h-full cursor-help z-100"
              data-tip={row.row.original.objectives
                .filter(
                  (objective) => !objective.team_score[nextTeam!.id]?.finished
                )
                .map((objective) => objective.name)
                .join(", ")}
            >
              {nextTeam?.name}: {num}
            </div>
          );
        },
        size: 400,
      },
      {
        header: "Is Team Focus?",
        accessorFn: (category) => teamGoals.category_ids.includes(category.id),
        cell: (row) => (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            defaultChecked={teamGoals.category_ids.includes(
              row.row.original.id
            )}
            key={"cat-" + row.row.original.id}
            onChange={(e) => {
              if (e.target.checked) {
                teamApi.createCategoryTeamSuggestion(currentEvent!.id, {
                  id: row.row.original.id,
                });
              } else {
                teamApi.deleteCategoryTeamSuggestion(
                  currentEvent!.id,
                  row.row.original.id
                );
              }
            }}
          />
        ),
      },
    ];
    return columns;
  }, [teamGoals, eventStatus]);

  const objectiveColumns = useMemo(() => {
    if (!eventStatus) {
      return [];
    }
    const columns: ColumnDef<ScoreObjective>[] = [
      {
        header: "Name",
        accessorKey: "name",
        size: 200,
      },
      {
        header: "Available Points",
        accessorFn: (objective) =>
          getPotentialPointsForObjective(objective)[eventStatus.team_id!],
        size: 200,
      },
      {
        header: "Required",
        accessorKey: "required_number",
        size: 150,
      },
      {
        header: "Missing",
        accessorFn: (objective) =>
          objective.required_number -
          objective.team_score[eventStatus.team_id!].number,
      },
      {
        header: "Opponent is missing",
        cell: (row) => {
          let num: number = 99999999;
          let nextTeam: Team | undefined;
          for (const team of currentEvent?.teams || []) {
            if (team.id === eventStatus.team_id) {
              continue;
            }
            const missing =
              row.row.original.required_number -
              row.row.original.team_score[team.id]?.number;
            if ((num == undefined || missing < num) && missing > 0) {
              num = missing;
              nextTeam = team;
            }
          }
          if (num === 99999999) {
            return "Last team to finish";
          }
          return `${nextTeam?.name}: ${num}`;
        },
        size: 400,
      },
      {
        header: "Is Team Focus?",
        accessorFn: (objective) =>
          teamGoals.objective_ids.includes(objective.id),
        cell: (row) => (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            defaultChecked={teamGoals.objective_ids.includes(
              row.row.original.id
            )}
            key={"obj-" + row.row.original.id}
            onChange={(e) => {
              if (e.target.checked) {
                teamApi.createObjectiveTeamSuggestion(currentEvent!.id, {
                  id: row.row.original.id,
                });
              } else {
                teamApi.deleteObjectiveTeamSuggestion(
                  currentEvent!.id,
                  row.row.original.id
                );
              }
            }}
          />
        ),
      },
    ];
    return columns;
  }, [teamGoals, eventStatus]);

  if (!scores) {
    return <div>Loading...</div>;
  }
  if (
    !eventStatus ||
    !eventStatus.is_team_lead ||
    eventStatus.team_id === undefined
  ) {
    return;
  }
  const categories = flattenCategories(scores);

  const relevantCategories = categories.filter(
    (category) =>
      category.scoring_preset?.scoring_method ===
        ScoringMethod.RANKED_COMPLETION_TIME &&
      eventStatus.team_id !== undefined &&
      !category.team_score[eventStatus.team_id]?.finished
  );

  const relevantObjectives = categories.flatMap((category) =>
    category.objectives.filter(
      (objective) =>
        objective.scoring_preset?.scoring_method ===
          ScoringMethod.RANKED_TIME &&
        !objective.team_score[eventStatus.team_id!]?.finished
    )
  );

  return (
    <div>
      <div className="divider divider-primary">Categories</div>
      <Table
        columns={categoryColumns}
        data={relevantCategories}
        className="h-[50vh] mt-8"
      />
      <div className="divider divider-primary">Objectives</div>
      <Table
        columns={objectiveColumns}
        data={relevantObjectives}
        className="h-[50vh] mt-8"
      />
    </div>
  );
}
