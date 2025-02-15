import React, { useContext, useEffect, useMemo } from "react";
import CrudTable from "../components/crudtable";
import {
  ApprovalStatus,
  Submission,
  SubmissionCreate,
} from "../types/submission";
import {
  fetchSubmissionsForEvent,
  reviewBounty,
  submitBounty,
} from "../client/submission-client";
import { GlobalStateContext } from "../utils/context-provider";
import { User, UserPermission } from "../types/user";
import {
  CheckOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import {
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import { getObjectives } from "../types/scoring-category";
import { ObjectiveType, ScoringObjective } from "../types/scoring-objective";
import { ScoringMethod } from "../types/scoring-preset";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
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

const SubmissionPage: React.FC = () => {
  const { user, currentEvent, rules } = useContext(GlobalStateContext);
  const [showModal, setShowModal] = React.useState(false);
  const [reloadTable, setReloadTable] = React.useState(false);
  const [pickedObjective, setPickedObjective] = React.useState<
    ScoringObjective | undefined
  >();

  const [pickedSubmission, setPickedSubmission] = React.useState<
    Partial<Submission> | undefined
  >();

  const formRef = React.useRef<FormInstance>(null);
  useEffect(() => {
    if (formRef.current && pickedSubmission) {
      formRef.current.setFieldsValue({
        id: pickedSubmission.id,
        objective_id: pickedSubmission.objective?.id,
        number: pickedSubmission.number,
        timestamp: dayjs(pickedSubmission.timestamp),
        proof: pickedSubmission.proof,
        comment: pickedSubmission.comment,
      });
    }
  }, [pickedSubmission]);

  const table = useMemo(() => {
    if (!currentEvent) {
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
              render: (user: User) =>
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
                        <EyeInvisibleOutlined />
                      </div>
                    );
                  case "APPROVED":
                    return (
                      <div
                        className="text-success tooltip cursor-help"
                        data-tip="Approved"
                      >
                        <CheckOutlined />
                      </div>
                    );
                  case "REJECTED":
                    return (
                      <div
                        className="text-error tooltip cursor-help"
                        data-tip="Rejected"
                      >
                        <CloseOutlined />
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
          fetchFunction={() => fetchSubmissionsForEvent(currentEvent.id)}
          addtionalActions={[
            {
              name: "Edit",
              func: async (submission: Partial<Submission>) => {
                setPickedSubmission(submission);
                setShowModal(true);
              },
              visible: (submission) => {
                if (!user || !submission.user) {
                  return false;
                }
                return submission.user.id === user.id;
              },
            },
            {
              name: "Approve",
              func: async (submission: Partial<Submission>) => {
                submission.id &&
                  reviewBounty(currentEvent.id, submission.id, {
                    approval_status: ApprovalStatus.APPROVED,
                  }).then(() => setReloadTable(!reloadTable));
              },
              visible: () =>
                user?.permissions.includes(UserPermission.ADMIN) ?? false,
            },
            {
              name: "Reject",
              func: async (submission: Partial<Submission>) => {
                submission.id &&
                  reviewBounty(currentEvent.id, submission.id, {
                    approval_status: ApprovalStatus.REJECTED,
                  }).then(() => setReloadTable(!reloadTable));
              },
              visible: () =>
                user?.permissions.includes(UserPermission.ADMIN) ?? false,
            },
          ]}
        />
      </div>
    );
  }, [currentEvent, reloadTable, user]);

  if (!currentEvent || !rules) {
    return <div>No event selected</div>;
  }
  const submissionObjectives = getObjectives(rules).filter(
    (objective) => objective.objective_type === ObjectiveType.SUBMISSION
  );
  return (
    <>
      <Modal
        title="Create Submission"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setPickedSubmission(undefined);
          setPickedObjective(undefined);
        }}
        onOk={() => formRef.current?.submit()}
      >
        <Form
          layout="vertical"
          ref={formRef}
          onFinish={(values) => {
            const submissionCreate: SubmissionCreate = {
              ...values,
              timestamp: values.timestamp.toISOString(),
            };
            submitBounty(currentEvent.id, submissionCreate).then(() => {
              setShowModal(false);
              setPickedSubmission(undefined);
              setReloadTable(!reloadTable);
            });
          }}
        >
          <Form.Item name="id" style={{ display: "none" }}>
            <Input />
          </Form.Item>
          <Form.Item required label="Objective" name="objective_id">
            <Select
              placeholder="Objective"
              onChange={(value) => {
                setPickedObjective(
                  submissionObjectives.find(
                    (objective) => objective.id === value
                  )
                );
              }}
            >
              {submissionObjectives.map((objective) => (
                <Select.Option key={objective.name} value={objective.id}>
                  {objective.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {pickedObjective &&
          pickedObjective.scoring_preset &&
          pickedObjective.scoring_preset.scoring_method ===
            ScoringMethod.RANKED_VALUE ? (
            <Form.Item required label="Value" name="number">
              <InputNumber />
            </Form.Item>
          ) : (
            ""
          )}
          <Form.Item required label="Timestamp" name="timestamp">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              defaultValue={
                pickedSubmission ? dayjs(pickedSubmission.timestamp) : undefined
              }
            />
          </Form.Item>
          <Form.Item label="Link to proof" name="proof">
            <Input />
          </Form.Item>
          <Form.Item label="Comment" name="comment">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      {table}
    </>
  );
};

export default SubmissionPage;
