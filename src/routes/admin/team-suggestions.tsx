import { ScoringMethod, Team, TeamSuggestion } from "@client/api";
import {
  useAddTeamSuggestion,
  useDeleteTeamSuggestion,
  useGetEventStatus,
  useGetTeamGoals,
} from "@client/query";
import Table from "@components/table";
import { ScoreObjective } from "@mytypes/score";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import {
  getPotentialPoints,
  getTotalPoints,
  iterateObjectives,
} from "@utils/utils";
import { useContext, useMemo } from "react";

export const Route = createFileRoute("/admin/team-suggestions")({
  component: TeamSuggestionsPage,
});

export function TeamSuggestionsPage() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const qc = useQueryClient();
  const { teamGoals = [] } = useGetTeamGoals(currentEvent.id);
  const { addTeamSuggestion } = useAddTeamSuggestion(currentEvent.id, qc);
  const { deleteTeamSuggestion } = useDeleteTeamSuggestion(currentEvent.id, qc);

  const categoryColumns = useMemo(() => {
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
        accessorFn: (category) =>
          getPotentialPoints(category)[eventStatus.team_id!] -
          getTotalPoints(category)[eventStatus.team_id!],
        size: 200,
      },

      {
        header: "Missing",
        accessorFn: (category) => {
          return category.children.filter(
            (objective) =>
              eventStatus.team_id !== undefined &&
              !objective.team_score[eventStatus.team_id]?.finished
          ).length;
        },
        cell: (row) => {
          return (
            <div
              className="tooltip tooltip-left w-full h-full cursor-help z-100"
              data-tip={row.row.original.children
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
            const missing = row.row.original.children.filter(
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
              data-tip={row.row.original.children
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
        size: 200,
      },
      {
        header: "Team Focus",
        accessorFn: (category) =>
          !!teamGoals.find((ts) => ts.objective_id === category.id),
        cell: (row) => (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            defaultChecked={
              !!teamGoals.find((ts) => ts.objective_id === row.row.original.id)
            }
            key={"cat-" + row.row.original.id}
            onChange={(e) => {
              if (e.target.checked) {
                addTeamSuggestion({
                  objective_id: row.row.original.id,
                });
              } else {
                deleteTeamSuggestion(row.row.original.id);
              }
            }}
          />
        ),
        size: 150,
      },
      {
        header: "Message for Team",
        accessorFn: (category) =>
          teamGoals.find((ts) => ts.objective_id === category.id),
        enableSorting: false,
        cell: ({ row, getValue }) => {
          const suggestion = getValue() as TeamSuggestion | undefined;
          return (
            <>
              {suggestion && (
                <form
                  className="flex flex-row gap-2 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const extra = formData.get("extra");
                    addTeamSuggestion({
                      objective_id: suggestion.objective_id,
                      extra: extra ? (extra as string) : undefined,
                    });
                  }}
                >
                  <textarea
                    className="textarea textarea-primary"
                    name="extra"
                    defaultValue={
                      teamGoals.find(
                        (ts) => ts.objective_id === suggestion.objective_id
                      )?.extra
                    }
                    key={"cat-" + row.original.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(e);
                    }}
                  />
                  <button type="submit" className="btn btn-primary h-full">
                    Save
                  </button>
                </form>
              )}
            </>
          );
        },
        size: 450,
      },
    ];
    return columns;
  }, [teamGoals, eventStatus, currentEvent]);

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
          getPotentialPoints(objective)[eventStatus.team_id!],
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
        size: 200,
      },
      {
        header: "Team Focus",
        accessorFn: (category) =>
          teamGoals.find((ts) => ts.objective_id === category.id),
        cell: ({ row, getValue }) => (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            defaultChecked={getValue() !== undefined}
            key={"cat-" + row.original.id}
            onChange={(e) => {
              if (e.target.checked) {
                addTeamSuggestion({
                  objective_id: row.original.id,
                });
              } else {
                deleteTeamSuggestion(row.original.id);
              }
            }}
          />
        ),
        size: 150,
      },
      {
        header: "Message for Team",
        accessorFn: (category) =>
          teamGoals.find((ts) => ts.objective_id === category.id),
        enableSorting: false,
        cell: ({ row, getValue }) => {
          console.log(getValue());
          const suggestion = getValue() as TeamSuggestion | undefined;
          return (
            <>
              {suggestion && (
                <form
                  className="flex flex-row gap-2 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const extra = formData.get("extra");
                    addTeamSuggestion({
                      objective_id: suggestion.objective_id,
                      extra: extra ? (extra as string) : undefined,
                    });
                  }}
                >
                  <textarea
                    className="textarea textarea-primary"
                    name="extra"
                    defaultValue={
                      teamGoals.find(
                        (ts) => ts.objective_id === suggestion.objective_id
                      )?.extra
                    }
                    key={"cat-" + row.original.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(e);
                    }}
                  />
                  <button type="submit" className="btn btn-primary h-full">
                    Save
                  </button>
                </form>
              )}
            </>
          );
        },
        size: 400,
      },
    ];
    return columns;
  }, [teamGoals, eventStatus, currentEvent]);

  if (!scores) {
    return <div>Loading...</div>;
  }
  if (
    !eventStatus ||
    !eventStatus.is_team_lead ||
    eventStatus.team_id === undefined
  ) {
    return <div>You must be a team lead to view this</div>;
  }
  const containers: ScoreObjective[] = [];
  const leaves: ScoreObjective[] = [];
  iterateObjectives(scores, (obj) => {
    if (obj.children.length > 0) {
      containers.push(obj as ScoreObjective);
    } else {
      leaves.push(obj as ScoreObjective);
    }
  });

  const relevantCategories = containers.filter(
    (category) =>
      category.scoring_preset?.scoring_method ===
        ScoringMethod.RANKED_COMPLETION_TIME &&
      eventStatus.team_id !== undefined &&
      !category.team_score[eventStatus.team_id]?.finished
  );

  const relevantObjectives = leaves.filter(
    (objective) =>
      objective.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME &&
      !objective.team_score[eventStatus.team_id!]?.finished &&
      (!objective.valid_from || new Date(objective.valid_from) < new Date())
  );

  return (
    <div className="flex flex-col gap-4 mt-4">
      <form
        className="flex flex-row gap-2 bg-base-300 rounded-box p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const extra = formData.get("extra");
          addTeamSuggestion({
            objective_id: scores.id,
            extra: extra ? (extra as string) : undefined,
          });
        }}
      >
        <div className="fieldset w-full">
          <label className="label">
            <span className="text-lg">
              Write a message for your team members
            </span>
          </label>
          <div className="flex flex-row gap-2 ">
            <textarea
              className="textarea textarea-primary w-full h-30"
              name="extra"
              defaultValue={
                teamGoals.find((ts) => ts.objective_id === scores.id)?.extra
              }
            />
            <button type="submit" className="btn btn-primary h-full">
              Save
            </button>
          </div>
        </div>
      </form>
      <div className="divider divider-primary m-0">Categories</div>
      <Table
        columns={categoryColumns}
        data={relevantCategories}
        className="max-h-[50vh]"
      />
      <div className="divider divider-primary m-0">Objectives</div>
      <Table
        columns={objectiveColumns}
        data={relevantObjectives}
        className="max-h-[50vh]"
      />
    </div>
  );
}
