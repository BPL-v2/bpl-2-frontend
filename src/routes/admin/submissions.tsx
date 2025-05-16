import { createFileRoute } from "@tanstack/react-router";
import React, { useContext } from "react";
import CrudTable from "@components/crudtable";

import { GlobalStateContext } from "@utils/context-provider";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  NonSensitiveUser,
  ObjectiveType,
  Permission,
  Submission,
} from "@client/api";
import { submissionApi } from "@client/client";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { getAllObjectives } from "@utils/utils";
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
  const { user, currentEvent, rules } = useContext(GlobalStateContext);
  const [reloadTable, setReloadTable] = React.useState(false);

  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }

  const submissionObjectives = getAllObjectives(rules).filter(
    (objective) => objective.objective_type === ObjectiveType.SUBMISSION
  );

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
        <fieldset className="fieldset mb-4 ">
          <label className="label">Objective</label>
          <select
            className="select select-bordered w-full max-w-xs"
            defaultValue=""
            name="objective"
            required
          >
            <option disabled value=""></option>
            {submissionObjectives.map((objective) => (
              <option key={objective.id} value={objective.id}>
                {objective.name}
              </option>
            ))}{" "}
          </select>

          {currentEvent.teams.map((team, idx) => (
            <>
              <label className="label">{idx + 1}. Place</label>
              <select
                required
                name={"place-" + idx}
                className="select select-bordered w-full max-w-xs"
                defaultValue=""
              >
                <option disabled value=""></option>
                {currentEvent.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </>
          ))}
        </fieldset>
        <button className="btn btn-primary mt-4" type="submit">
          Submit
        </button>
      </form>

      <CrudTable<Submission>
        resourceName="Submission"
        columns={[
          {
            title: "Objective",
            dataIndex: "objective",
            key: "objective",
            render: (objective) => objective.name,
          },
          {
            title: "Submitter",
            dataIndex: "user",
            key: "user",
            render: (user: NonSensitiveUser) =>
              user.display_name ? user.display_name : user.discord_name,
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
