import { createFileRoute } from "@tanstack/react-router";
import React, { useContext } from "react";
import CrudTable from "@components/crudtable";

import { GlobalStateContext } from "@utils/context-provider";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NonSensitiveUser, Permission, Submission } from "@client/api";
import { submissionApi } from "@client/client";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
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

export const Route = createFileRoute("/submissions")({
  component: SubmissionPage,
});

function SubmissionPage() {
  const { user, currentEvent, rules } = useContext(GlobalStateContext);
  const [reloadTable, setReloadTable] = React.useState(false);

  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }

  return (
    <div className=" mt-4">
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
              user?.permissions.includes(Permission.admin) ?? false,
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
              user?.permissions.includes(Permission.admin) ?? false,
          },
        ]}
      />
    </div>
  );
}

export default SubmissionPage;
