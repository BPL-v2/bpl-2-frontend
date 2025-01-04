import {
  Card,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  theme,
  Tooltip,
} from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";
import {
  CheckOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ScoreLite, ScoreObjective } from "../types/score";
import { red, green } from "@ant-design/colors";
import TeamScore from "../components/team-score";
import React from "react";
import { Submission, SubmissionCreate } from "../types/submission";
import {
  fetchSubmissionsForEvent,
  submitBounty,
} from "../client/submission-client";
import { ScoringMethod } from "../types/scoring-preset";

export type SubmissionTabProps = {
  categoryName: string;
};
const { useToken } = theme;

export function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, categoryName);
  const token = useToken().token;
  const [showModal, setShowModal] = React.useState(false);
  const [selectedObjective, setSelectedObjective] =
    React.useState<ScoreObjective>();
  const formRef = React.useRef<FormInstance>(null);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [reloadSubmissions, setReloadSubmissions] = React.useState(false);

  React.useEffect(() => {
    if (currentEvent) {
      fetchSubmissionsForEvent(currentEvent.id).then((data) =>
        setSubmissions(data)
      );
    }
  }, [currentEvent, reloadSubmissions]);

  if (!category || !currentEvent) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );
  function objectiveToAction(objective: ScoreObjective) {
    if (!eventStatus) {
      return null;
    }
    const submission = submissions.find(
      (submission) =>
        submission.objective.id === objective.id &&
        submission.team_id === eventStatus.team_id
    );

    if (!submission) {
      return (
        <Tooltip title={"Submit Bounty"}>
          <PlusOutlined
            onClick={() => {
              setSelectedObjective(objective);
              setShowModal(true);
            }}
          />
        </Tooltip>
      );
    }
    if (submission.approval_status === "PENDING") {
      return (
        <Tooltip title={"Submission is being reviewed"}>
          <EyeInvisibleOutlined />{" "}
        </Tooltip>
      );
    }
    if (submission.approval_status === "APPROVED") {
      return (
        <Tooltip title={"Submission has been approved"}>
          <CheckOutlined style={{ color: green[4] }} />
        </Tooltip>
      );
    }
    if (submission.approval_status === "REJECTED") {
      return (
        <Tooltip title={"Submission has been rejected"}>
          <CloseOutlined style={{ color: red[4] }} />
        </Tooltip>
      );
    }
  }

  return (
    <>
      <Modal
        title={`Submission for "${selectedObjective?.name}"`}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setSelectedObjective(undefined);
          formRef.current?.resetFields();
        }}
        onOk={() => formRef.current?.submit()}
      >
        <Form
          layout="vertical"
          ref={formRef}
          onFinish={(values) => {
            if (!selectedObjective) {
              return;
            }
            const submissionCreate: SubmissionCreate = {
              ...values,
              objective_id: selectedObjective.id,
              timestamp: values.timestamp.toISOString(),
            };
            submitBounty(currentEvent.id, submissionCreate).then(() => {
              setShowModal(false);
              setSelectedObjective(undefined);
              setReloadSubmissions(!reloadSubmissions);
            });
          }}
        >
          {selectedObjective &&
          selectedObjective.scoring_preset &&
          (selectedObjective.scoring_preset.scoring_method ===
            ScoringMethod.RANKED_VALUE ||
            selectedObjective.scoring_preset.scoring_method ===
              ScoringMethod.RANKED_REVERSE) ? (
            <Form.Item rules={[{ required: true }]} label="Value" name="number">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          ) : (
            ""
          )}
          <Form.Item
            rules={[{ required: true }]}
            label="Time"
            name="timestamp"
            help="in your timezone"
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Link to proof"
            name="proof"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Comment" name="comment">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <TeamScore category={category}></TeamScore>
      <Divider style={{ borderColor: token.colorPrimary }}>
        {category.name}
      </Divider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {category.objectives.map((objective) => {
          return (
            <Card
              key={objective.id}
              title={
                <Tooltip title={objective.extra}>
                  <div
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {objective.name}
                    {objective.extra ? (
                      <a style={{ color: red[6] }}>*</a>
                    ) : null}
                  </div>
                </Tooltip>
              }
              extra={objectiveToAction(objective)}
              size="small"
              styles={{
                body: {
                  padding: "0px",
                },
              }}
            >
              <table
                key={objective.id}
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: ".5rem",
                  marginBottom: ".5rem",
                }}
              >
                <tbody>
                  {Object.entries(objective.team_score)
                    .map(([teamId, score]) => {
                      return [parseInt(teamId), score] as [number, ScoreLite];
                    })
                    .sort(
                      ([, scoreA], [, scoreB]) => scoreB.points - scoreA.points
                    )
                    .map(([teamId, score]) => {
                      return (
                        <tr
                          key={teamId}
                          style={{
                            padding: "4px 8px",
                            backgroundColor:
                              teamId === eventStatus?.team_id
                                ? token.colorBgSpotlight
                                : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "4px 8px",
                              fontWeight: "bold",
                              color: score.rank === 0 ? red[4] : green[4],
                            }}
                          >
                            {score ? score.points : 0}
                          </td>
                          <td>{teamMap[teamId]?.name}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </Card>
          );
        })}
        {/* </Flex> */}
      </div>
    </>
  );
}
