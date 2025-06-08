import { createFileRoute } from "@tanstack/react-router";
import React, { useContext } from "react";

import { GlobalStateContext } from "@utils/context-provider";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Objective, ObjectiveType, Permission, Submission } from "@client/api";
import { submissionApi } from "@client/client";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { iterateObjectives } from "@utils/utils";
import Table from "@components/table";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { TeamName } from "@components/team-name";
import { useGetRules, useGetUser, useGetUsers } from "@client/query";
dayjs.extend(customParseFormat);

function renderStringWithUrl(string: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = string.match(urlRegex);
  if (urls) {
    urls.forEach((urlString) => {
      const url = new URL(urlString);
      string = string.replace(
        urlString,
        `<a class="link link-info" href="${urlString}" target="_blank">${url.hostname.replace("www.", "")}</a>`
      );
    });
  }
  return <div dangerouslySetInnerHTML={{ __html: string }} />;
}

export const Route = createFileRoute("/submissions")({
  component: SubmissionPage,
});

function SubmissionPage() {
  const { currentEvent } = useContext(GlobalStateContext);
  const [reloadTable, setReloadTable] = React.useState(false);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const { data: users } = useGetUsers(currentEvent.id);
  const { data: rules } = useGetRules(currentEvent.id);
  const { data: user } = useGetUser();
  const objectiveMap: Record<number, Objective> = {};
  iterateObjectives(rules, (objective) => {
    if (objective.objective_type === ObjectiveType.SUBMISSION) {
      objectiveMap[objective.id] = objective;
    }
  });
  React.useEffect(() => {
    if (currentEvent) {
      submissionApi.getSubmissions(currentEvent.id).then((data) => {
        setSubmissions(data);
      });
    }
  }, [currentEvent, reloadTable]);
  const getObjective = React.useMemo(() => {
    return (info: CellContext<Submission, unknown>) =>
      objectiveMap[info.row.original.objective_id] || {
        id: -1,
        name: "Unknown Objective",
      };
  }, [rules, objectiveMap]);

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
                  submissionApi
                    .reviewSubmission(currentEvent.id, submissionId, {
                      approval_status: "APPROVED",
                    })
                    .then(() => setReloadTable(!reloadTable));
                }}
              >
                Approve
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => {
                  submissionApi
                    .reviewSubmission(currentEvent.id, submissionId, {
                      approval_status: "REJECTED",
                    })
                    .then(() => setReloadTable(!reloadTable));
                }}
              >
                Reject
              </button>
            </div>
          );
        },
      });
    }
    return columns;
  }, [currentEvent, getObjective, users, user]);

  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }
  return (
    <Table<Submission>
      className="h-[70vh] mt-4"
      data={submissions}
      columns={columns}
      rowClassName={() => "hover:bg-base-200/50"}
    ></Table>
  );
}

export default SubmissionPage;
