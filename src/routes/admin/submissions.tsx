import { createFileRoute } from "@tanstack/react-router";
import React, { useContext, useMemo } from "react";

import { GlobalStateContext } from "@utils/context-provider";

import { Objective, ObjectiveType, Permission, Submission } from "@client/api";
import { submissionApi } from "@client/client";
import {
  useGetRules,
  useGetSubmissions,
  useGetUser,
  useGetUsers,
  useReviewSubmission,
} from "@client/query";
import Select from "@components/select";
import Table from "@components/table";
import { TeamName } from "@components/team-name";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { renderStringWithUrl } from "@utils/text-utils";
import { flatMap, iterateObjectives } from "@utils/utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export const Route = createFileRoute("/admin/submissions")({
  component: SubmissionPage,
});

function SubmissionPage() {
  const { currentEvent } = useContext(GlobalStateContext);
  const qc = useQueryClient();
  const { users, isLoading: usersLoading } = useGetUsers(currentEvent.id);
  const { rules, isLoading: rulesLoading } = useGetRules(currentEvent.id);
  const { user, isLoading: userLoading } = useGetUser();
  const { submissions = [], isLoading: submissionsLoading } = useGetSubmissions(
    currentEvent.id
  );
  const { reviewSubmission, isPending: reviewPending } = useReviewSubmission(
    qc,
    currentEvent.id
  );

  const objectiveMap: Record<number, Objective> = useMemo(() => {
    return {};
  }, []);
  iterateObjectives(rules, (objective) => {
    if (objective.objective_type === ObjectiveType.SUBMISSION) {
      objectiveMap[objective.id] = objective;
    }
  });

  const columns = React.useMemo(() => {
    if (!currentEvent || !rules || !users) {
      return [];
    }
    const columns: ColumnDef<Submission>[] = [
      {
        header: "",
        accessorKey: "objective_id",
        accessorFn: (row) => objectiveMap[row.objective_id]?.name,
        cell: (info) => info.getValue(),
        enableSorting: false,
        size: 250,
        filterFn: "includesString",
        meta: {
          filterVariant: "enum",
          filterPlaceholder: "Objective",
          options: Object.values(objectiveMap).map(
            (objective) => objective.name
          ),
        },
      },
      {
        header: "Submitter",
        accessorKey: "user_id",
        cell: (info) => {
          const user = users.find((u) => u.id === info.row.original.user_id);
          return user ? user.display_name : "Unknown User";
        },
        size: 200,
      },
      {
        header: "",
        accessorKey: "team_id",
        accessorFn: (row) =>
          currentEvent?.teams.find((t) => t.id === row.team_id)?.name,
        cell: (info) => {
          return (
            <TeamName
              team={currentEvent?.teams.find(
                (t) => t.id === info.row.original.team_id
              )}
            />
          );
        },
        enableSorting: false,
        size: 180,
        filterFn: "includesString",
        meta: {
          filterVariant: "enum",
          filterPlaceholder: "Team",
          options: currentEvent.teams.map((team) => team.name),
        },
      },
      {
        header: "Proof",
        accessorKey: "proof",
        size: 100,
        cell: (info) => {
          const proof = info.getValue();
          if (!proof) {
            return "No proof provided";
          }
          return renderStringWithUrl(info.row.original.proof);
        },
      },
      {
        header: "Comment",
        accessorKey: "comment",
        size: 200,
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        header: "Value",
        accessorKey: "number",
        cell: (info) => {
          // const scoringMethod =
          //   getObjective(info).scoring_preset?.scoring_method;
          // console.log(getObjective(info).scoring_preset_id);
          // if (
          //   !scoringMethod ||
          //   (scoringMethod !== ScoringMethod.RANKED_VALUE &&
          //     scoringMethod !== ScoringMethod.RANKED_REVERSE)
          // ) {
          //   return;
          // }
          return info.getValue();
        },
        size: 100,
      },
      {
        header: "Status",
        accessorKey: "approval_status",
        size: 100,
        cell: (info) => {
          switch (info.getValue()) {
            case "PENDING":
              return (
                <div
                  className="text-warning tooltip cursor-help"
                  data-tip="Pending"
                >
                  <EyeSlashIcon className="h-6 w-6 text-warning" />
                </div>
              );
            case "APPROVED":
              return (
                <div
                  className="text-success tooltip cursor-help"
                  data-tip="Approved"
                >
                  <CheckCircleIcon className="h-6 w-6 text-success" />
                </div>
              );
            case "REJECTED":
              return (
                <div
                  className="text-error tooltip cursor-help"
                  data-tip="Rejected"
                >
                  <XCircleIcon className="h-6 w-6 text-error" />
                </div>
              );
            default:
              return "Unknown";
          }
        },
      },
      {
        header: "Timestamp",
        accessorKey: "timestamp",
        cell: (info) => new Date(info.row.original.timestamp).toLocaleString(),
        size: 170,
      },
    ];
    if (user?.permissions.includes(Permission.submission_judge)) {
      columns.push({
        header: "Actions",
        accessorKey: "id",
        enableSorting: false,
        cell: (info) => {
          const submissionId = info.row.original.id;
          return (
            <div className="flex flex-col gap-1">
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
                  reviewSubmission({
                    submissionId: submissionId,
                    approvalStatus: "APPROVED",
                  });
                }}
                disabled={reviewPending}
              >
                {reviewPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : null}
                Approve
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => {
                  reviewSubmission({
                    submissionId: submissionId,
                    approvalStatus: "REJECTED",
                  });
                }}
                disabled={reviewPending}
              >
                {reviewPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : null}
                Reject
              </button>
            </div>
          );
        },
      });
    }
    return columns;
  }, [
    currentEvent,
    users,
    user,
    objectiveMap,
    reviewSubmission,
    rules,
    reviewPending,
  ]);

  // Show loading state while any data is loading
  if (usersLoading || rulesLoading || userLoading || submissionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-lg">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }
  const submissionObjectives = flatMap(rules).filter(
    (objective) => objective.objective_type === ObjectiveType.SUBMISSION
  );
  return (
    <div className=" mt-4 flex flex-col">
      {" "}
      <form
        className="mb-4 bg-base-200 flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const objectiveId = parseInt(formData.get("objective") as string);
          const places = currentEvent.teams
            .map((_, idx) => {
              const place = formData.get("place-" + idx);
              if (!place) {
                alert("You have to select a team for each place");
                return;
              }
              return parseInt(place as string);
            })
            .filter((place) => place !== undefined);
          if (new Set(places).size !== places.length) {
            alert("You have to select different teams for each place");
            return;
          }
          submissionApi
            .setBulkSubmissionForAdmin(currentEvent.id, {
              objective_id: objectiveId,
              team_ids: places,
            })
            .then(() => {
              qc.invalidateQueries({
                queryKey: ["submissions", currentEvent.id],
              });
              form.reset();
            });
        }}
      >
        <fieldset className="fieldset mb-4 m-4 w-md bg-base-300 rounded-box p-4">
          <label className="label">Objective</label>
          <Select
            className="w-full"
            placeholder="Select an objective"
            name="objective"
            required
            options={submissionObjectives.map((objective) => ({
              label: objective.name,
              value: String(objective.id),
            }))}
          ></Select>
          {currentEvent.teams.map((_, idx) => (
            <>
              <label className="label">{idx + 1}. Place</label>
              <Select
                required
                name={"place-" + idx}
                className="w-full"
                placeholder="Select a team"
                options={currentEvent.teams.map((team) => ({
                  label: team.name,
                  value: String(team.id),
                }))}
              ></Select>
            </>
          ))}
          <button className="btn btn-primary mt-2" type="submit">
            Submit
          </button>
        </fieldset>
      </form>
      <Table<Submission>
        className="h-[70vh] mt-4"
        data={submissions}
        columns={columns}
        rowClassName={() => "hover:bg-base-200/50"}
      ></Table>
    </div>
  );
}

export default SubmissionPage;
