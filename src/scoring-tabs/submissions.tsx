import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { ScoreObjective } from "../types/score";
import TeamScore from "../components/team-score";
import React from "react";
import { router } from "../router";
import { Score, SubmissionCreate, Team } from "../client";
import { submissionApi } from "../client/client";
import { DateTimePicker } from "../components/datetime-picker";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Dialog } from "../components/dialog";

export type SubmissionTabProps = {
  categoryName: string;
};

export function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, categoryName);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedObjective, setSelectedObjective] =
    React.useState<ScoreObjective>();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [reloadSubmissions, setReloadSubmissions] = React.useState(false);

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
            submissionApi
              .submitBounty(currentEvent.id, submissionCreate)
              .then(() => {
                setShowModal(false);
                setSelectedObjective(undefined);
                setReloadSubmissions(!reloadSubmissions);
              });
            setShowModal(false);
            setSelectedObjective(undefined);
          }}
          className="form"
        >
          <fieldset className="fieldset bg-base-300 p-6 rounded-box">
            <DateTimePicker
              label="Time (in your timezone)"
              name="timestamp"
            ></DateTimePicker>
            {/* <label className="label">Value</label>
            <input
              type="number"
              className="input w-full"
              required
              name="number"
            /> */}
            <label className="label">Link to proof</label>
            <input type="text" className="input w-full" required name="proof" />
            <label className="label">Comment</label>
            <input type="text" className="input w-full" name="comment" />
          </fieldset>
        </form>
        <div className="modal-action">
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
      <TeamScore category={category}></TeamScore>
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
            <div className="card bg-base-300" key={objective.id}>
              <div className="h-22 flex items-center justify-between bg-base-200 rounded-t-box px-4">
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
                      className="btn btn-sm btn-ghost"
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
                            className={`px-4 bg-base-300 ${
                              eventStatus?.team_id === teamId
                                ? "bg-white/10"
                                : ""
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
      </div>
    </>
  );
}
