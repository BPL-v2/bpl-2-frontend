import { createFileRoute } from "@tanstack/react-router";
import React, { useContext } from "react";
import CrudTable from "@components/crudtable";

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
import { flatMap, iterateObjectives } from "@utils/utils";
import Select from "@components/select";
import { useGetRules, useGetUser, useGetUsers } from "@client/query";
dayjs.extend(customParseFormat);

function renderStringWithUrl(string: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = string.match(urlRegex);
  if (urls) {
    urls.forEach((url) => {
      string = string.replace(
        url,
        `<a href="${url}" target="_blank">${url}</a>`
      );
    });
  }
  return <div dangerouslySetInnerHTML={{ __html: string }} />;
}

export const Route = createFileRoute("/admin/submissions")({
  component: SubmissionPage,
});

function SubmissionPage() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { data: rules } = useGetRules(currentEvent.id);
  const { data: user } = useGetUser();
  const { data: users } = useGetUsers(currentEvent.id);
  const [reloadTable, setReloadTable] = React.useState(false);
  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }
  const objectiveMap: Record<number, Objective> = {};
  iterateObjectives(rules, (objective) => {
    if (objective.objective_type === ObjectiveType.SUBMISSION) {
      objectiveMap[objective.id] = objective;
    }
  });
  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }

  const submissionObjectives = flatMap(rules).filter(
    (objective) => objective.objective_type === ObjectiveType.SUBMISSION
  );
  if (!user?.permissions.includes(Permission.submission_judge)) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>You do not have permission to view this page</span>
        </div>
      </div>
    );
  }

  return (
    <div className=" mt-4 flex flex-col">
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
              setReloadTable(!reloadTable);
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
          {currentEvent.teams.map((team, idx) => (
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

      <CrudTable<Submission>
        resourceName="Submission"
        columns={[
          {
            title: "Objective",
            dataIndex: "objective_id",
            key: "objective_id",
            render: (objective_id: number) => {
              console.log(objective_id);
              return objectiveMap[objective_id]?.name ?? "Unknown";
            },
          },
          {
            title: "Submitter",
            dataIndex: "user_id",
            key: "user_id",
            render: (user_id: number) => {
              const user = users?.find((u) => u.id === user_id);
              return user ? user.display_name : "Unknown User";
            },
          },
          {
            title: "Value*",
            dataIndex: "number",
            key: "number",
          },
          {
            title: "Proof",
            dataIndex: "proof",
            key: "proof",
            render: renderStringWithUrl,
          },
          {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => new Date(timestamp).toLocaleString(),
          },
          {
            title: "Status",
            dataIndex: "approval_status",
            key: "approval_status",
            render: (approvalStatus) => {
              switch (approvalStatus) {
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
              }
            },
          },
          {
            title: "Comment",
            dataIndex: "comment",
            key: "comment",
          },
        ]}
        fetchFunction={() => submissionApi.getSubmissions(currentEvent.id)}
        addtionalActions={[
          {
            name: "Approve",
            func: async (submission: Partial<Submission>) => {
              submission.id &&
                submissionApi
                  .reviewSubmission(currentEvent.id, submission.id, {
                    approval_status: "APPROVED",
                  })
                  .then(() => setReloadTable(!reloadTable));
            },
            visible: () =>
              user?.permissions.includes(Permission.submission_judge) ?? false,
          },
          {
            name: "Reject",
            func: async (submission: Partial<Submission>) => {
              submission.id &&
                submissionApi
                  .reviewSubmission(currentEvent.id, submission.id, {
                    approval_status: "REJECTED",
                  })
                  .then(() => setReloadTable(!reloadTable));
            },
            visible: () =>
              user?.permissions.includes(Permission.submission_judge) ?? false,
          },
          {
            name: "Delete",
            func: async (submission: Partial<Submission>) => {
              submission.id &&
                submissionApi
                  .deleteSubmission(currentEvent.id, submission.id)
                  .then(() => setReloadTable(!reloadTable));
            },
            visible: () =>
              user?.permissions.includes(Permission.submission_judge) ?? false,
          },
        ]}
      />
    </div>
  );
}

export default SubmissionPage;
