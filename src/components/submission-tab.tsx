import { useContext, useRef, useState } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ScoreObjective } from "@mytypes/score";
import TeamScoreDisplay from "./team-score";
import {
  AggregationType,
  ObjectiveType,
  Score,
  SubmissionCreate,
  Team,
} from "@client/api";
import { DateTimePicker } from "./datetime-picker";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Dialog } from "./dialog";
import { Link } from "@tanstack/react-router";
import { CollectionCardTable } from "./collection-card-table";
import { useGetEventStatus, useSubmitBounty } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";

export type SubmissionTabProps = {
  categoryName: string;
};

function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { scores, currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const qc = useQueryClient();
  const { submitBounty } = useSubmitBounty(qc, currentEvent.id);
  const category = scores?.children.find((cat) => cat.name === categoryName);
  const [showModal, setShowModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<ScoreObjective>();
  const formRef = useRef<HTMLFormElement>(null);

  if (!category || !currentEvent || !currentEvent.teams) {
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
      <Dialog
        title={`Submission for "${selectedObjective?.name}"`}
        open={showModal}
        setOpen={setShowModal}
      >
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const values = Object.fromEntries(
              new FormData(e.target as HTMLFormElement)
            ) as any;

            if (!selectedObjective) {
              return;
            }
            const submissionCreate: SubmissionCreate = {
              ...values,
              number: parseInt(values.number) || 1,
              objective_id: selectedObjective.id,
            };
            submitBounty(submissionCreate);
            setShowModal(false);
          }}
          className="form w-full"
        >
          <fieldset className="fieldset bg-base-300 p-6 rounded-box">
            <DateTimePicker
              label="Time (in your timezone)"
              name="timestamp"
            ></DateTimePicker>
            {/* TODO: generalize this  */}
            {selectedObjective?.aggregation == AggregationType.MAXIMUM && (
              <>
                <label className="label">Amount of Jewels dropped</label>
                <input
                  type="number"
                  className="input w-full"
                  required
                  name="number"
                />
              </>
            )}
            {selectedObjective?.aggregation == AggregationType.MINIMUM && (
              <>
                <label className="label">
                  Time taken for completion in seconds
                </label>
                <input
                  type="number"
                  className="input w-full"
                  required
                  name="number"
                />
              </>
            )}
            <label className="label">Link to proof</label>
            <input type="text" className="input w-full" required name="proof" />
            <label className="label">Comment</label>
            <input type="text" className="input w-full" name="comment" />
          </fieldset>
        </form>
        <div className="modal-action w-full">
          <button
            className="btn btn-soft"
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => formRef.current?.requestSubmit()}
          >
            Submit
          </button>
        </div>
      </Dialog>
      <TeamScoreDisplay objective={category}></TeamScoreDisplay>
      <h1 className="text-xl mt-4">
        Click to see all{" "}
        <Link
          to={`/submissions`}
          className="text-primary underline cursor-pointer"
        >
          Submissions
        </Link>
      </h1>
      <div className="divider divider-primary">{category.name}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {category.children
          .filter(
            (objective) => objective.objective_type == ObjectiveType.SUBMISSION
          )
          .map((objective) => {
            const teamIds = currentEvent.teams
              .sort((a, b) => {
                if (a.id === eventStatus?.team_id) return -1;
                if (b.id === eventStatus?.team_id) return 1;
                return (
                  (objective.team_score[b.id]?.points || 0) -
                  (objective.team_score[a.id]?.points || 0)
                );
              })
              .slice(
                0,
                preferences.limitTeams ? preferences.limitTeams : undefined
              )
              .map((team) => team.id);

            return (
              <div className="card bg-base-300" key={objective.id}>
                <div className="h-22 flex items-center justify-between bg-base-200 rounded-t-box px-4">
                  <div
                    className={"w-full " + (objective.extra ? "tooltip" : "")}
                    data-tip={objective.extra}
                  >
                    <h3 className="flex-grow text-center m-4 text-xl font-medium mr-4 ">
                      {`${objective.name}`}
                      {objective.extra ? <i className="text-error">*</i> : null}
                    </h3>
                  </div>
                  {eventStatus?.team_id ? (
                    <div className="tooltip" data-tip="Submit Bounty">
                      <button
                        className="rounded-full"
                        onClick={() => {
                          setSelectedObjective(objective);
                          setShowModal(true);
                        }}
                      >
                        <PlusCircleIcon className="h-8 w-8 cursor-pointer" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="pb-4 mb-0 rounded-b-box">
                  <table
                    key={objective.id}
                    className="w-full border-collapse mt-4"
                  >
                    <tbody>
                      {Object.entries(objective.team_score)
                        .filter(([teamId]) =>
                          teamIds.includes(parseInt(teamId))
                        )
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
                              className={
                                eventStatus?.team_id === teamId
                                  ? "bg-highlight content-highlight"
                                  : "bg-base-300"
                              }
                            >
                              <td
                                className={`pl-4 py-1 text-left ${
                                  score.points == 0
                                    ? "text-error"
                                    : "text-success"
                                }`}
                              >
                                {score ? score.points : 0}{" "}
                                {score.number > 1 ? `(${score.number})` : ""}
                              </td>
                              <td className="pr-4 text-right">
                                {teamMap[teamId]?.name}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        {category.children
          .filter(
            (objective) => objective.objective_type != ObjectiveType.SUBMISSION
          )
          .map((objective) => (
            <div className="card bg-base-300" key={objective.id}>
              <div className="h-22 flex items-center justify-between bg-base-200 rounded-t-box px-4">
                <div
                  className={objective.extra ? "tooltip  text-2xl " : undefined}
                  data-tip={objective.extra}
                ></div>
                <h3 className="flex-grow text-center m-4 text-xl font-medium mr-4">
                  {`${objective.name}`}
                  {objective.extra ? <i className="text-error">*</i> : null}
                </h3>
              </div>
              <div className="pb-4 mb-0 bg-base-300 rounded-b-box mt-2">
                <CollectionCardTable objective={objective} />
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default SubmissionTab;
