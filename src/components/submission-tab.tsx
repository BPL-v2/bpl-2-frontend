import {
  ApprovalStatus,
  ObjectiveType,
  Score,
  Submission,
  Team,
} from "@client/api";
import {
  useGetEventStatus,
  useGetSubmissions,
  useGetUsers,
} from "@client/query";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  LinkIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { TwitchFilled } from "@icons/twitch";
import { YoutubeFilled } from "@icons/youtube";
import { ScoreObjective } from "@mytypes/score";
import { Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useState } from "react";
import { twMerge } from "tailwind-merge";
import { CollectionCardTable } from "./collection-card-table";
import { SubmissionDialog } from "./submission-diablog";
import TeamScoreDisplay from "./team-score";

export type SubmissionTabProps = {
  categoryName: string;
};

function getUrls(string: string): URL[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = string.match(urlRegex) || [];
  return urls.map((url) => new URL(url));
}

function getRelevantSubmission(
  submissions: Submission[]
): Submission | undefined {
  if (submissions.length === 0) {
    return;
  }
  const approved = submissions.find(
    (submission) => submission.approval_status === ApprovalStatus.APPROVED
  );
  if (approved) {
    return approved;
  }
  const pending = submissions.find(
    (submission) => submission.approval_status === ApprovalStatus.PENDING
  );
  if (pending) {
    return pending;
  }
  return submissions[0];
}

function SubmissionStatus({
  submissions,
  userMap,
}: {
  submissions: Submission[];
  userMap: { [userId: number]: string };
}) {
  const submission = getRelevantSubmission(submissions);
  if (!submission) {
    return <MinusCircleIcon className="h-5 w-5" />;
  }

  if (submission.approval_status === ApprovalStatus.APPROVED) {
    return (
      <div className="tooltip tooltip-success tooltip-left">
        <span className="tooltip-content">
          Submitted by {userMap[submission.user_id]}
        </span>
        <CheckCircleIcon className="h-5 w-5 text-success" />
      </div>
    );
  }
  if (submission.approval_status === ApprovalStatus.PENDING) {
    return (
      <div className="tooltip tooltip-warning tooltip-left" data-tip="Pending">
        <span className="tooltip-content">
          Submitted by {userMap[submission.user_id]} - In Review
        </span>
        <EyeSlashIcon className="h-5 w-5 text-warning" />{" "}
      </div>
    );
  }

  return (
    <div className="tooltip tooltip-warning tooltip-left" data-tip="Pending">
      <span className="tooltip-content">
        Submitted by {userMap[submission.user_id]} - Rejected by{" "}
        {userMap[submission.reviewer_id!]}
      </span>
      <XCircleIcon className="h-5 w-5 text-error" />
    </div>
  );
}

function VideoButton({ submissions }: { submissions: Submission[] }) {
  const submission = getRelevantSubmission(submissions);
  if (!submission) {
    return null;
  }
  const urls = getUrls(submission?.proof);
  const youtubeUrl = urls.find(
    (url) =>
      url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtu.be")
  );
  if (youtubeUrl) {
    return (
      <a href={youtubeUrl.href} target="_blank">
        <YoutubeFilled className="h-5 w-5" brandColor></YoutubeFilled>
      </a>
    );
  }
  const twitchUrl = urls.find((url) => url.hostname.endsWith("twitch.tv"));
  if (twitchUrl) {
    if (
      new Date(submission.timestamp) <
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
    ) {
      return (
        <TwitchFilled className="h-5 w-5 cursor-not-allowed"></TwitchFilled>
      );
    }
    return (
      <a href={twitchUrl.href} target="_blank">
        <TwitchFilled className="h-5 w-5" brandColor></TwitchFilled>
      </a>
    );
  }
  if (urls.length > 0) {
    return (
      <a href={urls[0].href} target="_blank">
        <LinkIcon className="h-5 w-5 text-blue-500"></LinkIcon>
      </a>
    );
  }
  return null;
}

function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { scores, currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const category = scores?.children.find((cat) => cat.name === categoryName);
  const [showModal, setShowModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<ScoreObjective>();
  const { submissions = [] } = useGetSubmissions(currentEvent.id);
  const { users } = useGetUsers(currentEvent.id);
  const userMap =
    users?.reduce((acc: { [userId: number]: string }, user) => {
      acc[user.id] = user.display_name;
      return acc;
    }, {}) || {};

  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );

  if (!category) {
    return <></>;
  }
  return (
    <>
      <SubmissionDialog
        objective={selectedObjective}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={category}></TeamScoreDisplay>
        <h1 className="text-xl">
          Click to see all{" "}
          <Link
            to={"/submissions"}
            className="text-primary underline cursor-pointer"
          >
            Submissions
          </Link>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.children
            .filter(
              (objective) =>
                objective.objective_type == ObjectiveType.SUBMISSION
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
                <div className="card bg-base-300 bborder" key={objective.id}>
                  <div className="min-h-22 h-full flex items-center justify-between bg-base-200 rounded-t-box py-2 px-4 bborder-b">
                    <div
                      className={twMerge(
                        "w-full",
                        objective.extra && "tooltip tooltip-primary"
                      )}
                    >
                      <div className="tooltip-content text-xl max-w-75">
                        {objective.extra}
                      </div>
                      <h3 className="flex-grow text-center text-xl font-medium mr-4">
                        {objective.name}
                        {objective.extra ? (
                          <i className="text-error">*</i>
                        ) : null}
                      </h3>
                    </div>
                    {eventStatus?.team_id ? (
                      <div
                        className="tooltip tooltip-left lg:tooltip-top"
                        data-tip="Submit Bounty"
                      >
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
                  <div className="rounded-b-box">
                    <table
                      key={objective.id}
                      className="w-full border-collapse"
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
                          .map(([teamId, score], idx) => {
                            const s = submissions.filter(
                              (submission) =>
                                submission.team_id === teamId &&
                                submission.objective_id === objective.id
                            );
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
                                  className={twMerge(
                                    "pl-4 py-1 text-left",
                                    idx === teamIds.length - 1 &&
                                      "rounded-bl-box",
                                    score.points == 0
                                      ? "text-error"
                                      : "text-success"
                                  )}
                                >
                                  {score?.points || 0}{" "}
                                  {score.number > 1 && `(${score.number})`}
                                </td>
                                <td
                                  className={twMerge(
                                    "pr-4 text-right   ",
                                    idx === teamIds.length - 1 &&
                                      "rounded-br-box"
                                  )}
                                >
                                  <div className="flex gap-2 rounded-br-box items-center justify-end">
                                    <span className="">
                                      {teamMap[teamId]?.name}
                                    </span>
                                    <VideoButton submissions={s} />
                                    <SubmissionStatus
                                      submissions={s}
                                      userMap={userMap}
                                    />
                                  </div>
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
              (objective) =>
                objective.objective_type != ObjectiveType.SUBMISSION
            )
            .map((objective) => (
              <div className="card bg-base-300 bborder" key={objective.id}>
                <div className="min-h-22 h-full flex items-center justify-between bg-base-200 rounded-t-box px-4 bborder-b">
                  <div
                    className={
                      objective.extra ? "tooltip tooltip-primary" : undefined
                    }
                  >
                    <div className="tooltip-content text-xl max-w-75">
                      {objective.extra}
                    </div>
                    <h3 className="flex-grow text-center m-4 text-xl font-medium mr-4">
                      {objective.name}
                      {objective.extra ? <i className="text-error">*</i> : null}
                    </h3>
                  </div>
                </div>
                <CollectionCardTable objective={objective} />
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default SubmissionTab;
