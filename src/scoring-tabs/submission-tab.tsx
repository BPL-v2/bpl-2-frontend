import { DatePicker, Form, FormInstance, Input, InputNumber } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { ScoreObjective } from "../types/score";
import TeamScore from "../components/team-score";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { router } from "../router";
import { Score, ScoringMethod, SubmissionCreate, Team } from "../client";
import { submissionApi } from "../client/client";

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

  return (
    <>
      <dialog
        id="my_modal_1"
        className="modal"
        open={showModal}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
            setSelectedObjective(undefined);
            formRef.current?.resetFields();
          }
        }}
        onClose={() => {
          setShowModal(false);
          setSelectedObjective(undefined);
          formRef.current?.resetFields();
        }}
      >
        <div className="modal-box bg-base-200 border-2 border-base-100">
          <h3 className="font-bold text-lg mb-8">{`Submission for "${selectedObjective?.name}"`}</h3>

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
              submissionApi
                .submitBounty(currentEvent.id, submissionCreate)
                .then(() => {
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
              <Form.Item
                rules={[{ required: true }]}
                label="Value"
                name="number"
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            ) : (
              ""
            )}
            <Form.Item
              rules={[{ required: true }]}
              label="Time (in your timezone)"
              name="timestamp"
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
          <div className="modal-action">
            <button
              className="btn btn-soft"
              onClick={() => {
                setShowModal(false);
                formRef.current?.resetFields();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => formRef.current?.submit()}
            >
              Submit
            </button>
          </div>
        </div>
      </dialog>
      <TeamScore category={category}></TeamScore>{" "}
      <h1 className="text-xl mt-4">
        Click to see all{" "}
        <a
          href={`/submissions?type=${category.name}`}
          onClick={(e) => {
            e.preventDefault();
            router.navigate(`/submissions?type=${category.name}`);
          }}
          className="text-primary underline cursor-pointer"
        >
          Submissions
        </a>
      </h1>
      <div className="divider divider-primary">{category.name}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {category.objectives.map((objective) => {
          return (
            <div className="card bg-base-200" key={objective.id}>
              <div className="h-22 flex items-center justify-between bg-base-200 top-box-rounded px-4">
                <div
                  className={objective.extra ? "tooltip  text-2xl " : undefined}
                  data-tip={objective.extra}
                ></div>
                <h3 className="flex-grow text-center m-4 text-xl font-medium mr-4">
                  {`${objective.name}`}
                  {objective.extra ? <a className="text-error">*</a> : null}
                </h3>

                {eventStatus?.team_id ? (
                  <div className="tooltip" data-tip="Submit Bounty">
                    <button
                      className="btn bg-highlight btn-sm"
                      onClick={() => {
                        setSelectedObjective(objective);
                        setShowModal(true);
                      }}
                    >
                      <PlusOutlined />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="pb-4 mb-0 bg-base-300 bottom-box-rounded">
                <table key={objective.id} className="w-full border-collapse">
                  <tbody className="">
                    {Object.entries(objective.team_score)
                      .map(([teamId, score]) => {
                        return [parseInt(teamId), score] as [number, Score];
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
