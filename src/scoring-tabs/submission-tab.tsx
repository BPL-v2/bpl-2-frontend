import {
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
} from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";
import { ScoreLite, ScoreObjective } from "../types/score";
import { red } from "@ant-design/colors";
import TeamScore from "../components/team-score";
import React from "react";
import { SubmissionCreate } from "../types/submission";
import { submitBounty } from "../client/submission-client";
import { ScoringMethod } from "../types/scoring-preset";

export type SubmissionTabProps = {
  categoryName: string;
};

export function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, categoryName);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedObjective, setSelectedObjective] =
    React.useState<ScoreObjective>();
  const formRef = React.useRef<FormInstance>(null);
  // const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [reloadSubmissions, setReloadSubmissions] = React.useState(false);

  // React.useEffect(() => {
  //   if (currentEvent) {
  //     fetchSubmissionsForEvent(currentEvent.id).then((data) =>
  //       setSubmissions(data)
  //     );
  //   }
  // }, [currentEvent, reloadSubmissions]);

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
  // function objectiveToAction(objective: ScoreObjective) {
  //   if (!eventStatus) {
  //     return null;
  //   }
  //   const submission = submissions.find(
  //     (submission) =>
  //       submission.objective.id === objective.id &&
  //       submission.team_id === eventStatus.team_id
  //   );

  //   if (!submission) {
  //     return (
  //       <Tooltip title={"Submit Bounty"}>
  //         <PlusOutlined
  //           onClick={() => {
  //             setSelectedObjective(objective);
  //             setShowModal(true);
  //           }}
  //         />
  //       </Tooltip>
  //     );
  //   }
  //   if (submission.approval_status === "PENDING") {
  //     return (
  //       <Tooltip title={"Submission is being reviewed"}>
  //         <EyeInvisibleOutlined />{" "}
  //       </Tooltip>
  //     );
  //   }
  //   if (submission.approval_status === "APPROVED") {
  //     return (
  //       <Tooltip title={"Submission has been approved"}>
  //         <CheckOutlined style={{ color: green[4] }} />
  //       </Tooltip>
  //     );
  //   }
  //   if (submission.approval_status === "REJECTED") {
  //     return (
  //       <Tooltip title={"Submission has been rejected"}>
  //         <CloseOutlined style={{ color: red[4] }} />
  //       </Tooltip>
  //     );
  //   }
  // }

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
      <TeamScore category={category}></TeamScore>{" "}
      <div className="divider divider-primary">{category.name}</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
        {category.objectives.map((objective) => {
          return (
            <div className="card bg-base-200" key={objective.id}>
              <div className="h-22">
                <div
                  className={objective.extra ? "tooltip  text-2xl " : undefined}
                  data-tip={objective.extra}
                >
                  <h3 className="flex-grow text-center m-4 text-xl font-medium mr-4">
                    {`${objective.name}`}
                    {objective.extra ? (
                      <a style={{ color: red[6] }}>*</a>
                    ) : null}
                  </h3>
                </div>
              </div>
              <div className="pb-4 mb-0 bg-base-300 bottom-box-rounded">
                <table key={objective.id} className="w-full border-collapse">
                  <tbody className="">
                    {Object.entries(objective.team_score)
                      .map(([teamId, score]) => {
                        return [parseInt(teamId), score] as [number, ScoreLite];
                      })
                      .sort(
                        ([, scoreA], [, scoreB]) =>
                          scoreB.points - scoreA.points
                      )
                      .map(([teamId, score]) => {
                        return (
                          <tr
                            key={teamId}
                            className={`px-4  ${
                              eventStatus?.team_id === teamId
                                ? "bg-highlight"
                                : "bg-base-300"
                            }`}
                          >
                            <td
                              className={`pl-8 text-left ${
                                score.points == 0
                                  ? "text-error"
                                  : "text-success"
                              }`}
                            >
                              {score ? score.points : 0}
                            </td>
                            <td>{teamMap[teamId]?.name}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {/* <Card
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
            </Card> */}

        {/* </Flex> */}
      </div>
    </>
  );
}
