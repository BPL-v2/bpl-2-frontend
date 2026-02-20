import { ApprovalStatus, Submission, Team } from "@client/api";
import {
  useGetEventStatus,
  useGetSubmissions,
  useGetUsers,
} from "@client/query";
import { SubmissionDialog } from "@components/submission-diablog";
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
import { ScoreClass, ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { renderScore } from "@utils/score";
import { getPotentialPoints, getTotalPoints } from "@utils/utils";
import { useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

function getUrls(string: string): URL[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = string.match(urlRegex) || [];
  return urls.map((url) => new URL(url));
}

function getRelevantSubmission(
  submissions: Submission[],
): Submission | undefined {
  if (submissions.length === 0) {
    return;
  }
  const approved = submissions.find(
    (submission) => submission.approval_status === ApprovalStatus.APPROVED,
  );
  if (approved) {
    return approved;
  }
  const pending = submissions.find(
    (submission) => submission.approval_status === ApprovalStatus.PENDING,
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
    return <MinusCircleIcon className="size-5" />;
  }

  if (submission.approval_status === ApprovalStatus.APPROVED) {
    return (
      <div className="tooltip tooltip-left tooltip-success">
        <span className="tooltip-content">
          Submitted by {userMap[submission.user_id]}
        </span>
        <CheckCircleIcon className="size-5 text-success" />
      </div>
    );
  }
  if (submission.approval_status === ApprovalStatus.PENDING) {
    return (
      <div className="tooltip tooltip-left tooltip-warning" data-tip="Pending">
        <span className="tooltip-content">
          Submitted by {userMap[submission.user_id]} - In Review
        </span>
        <EyeSlashIcon className="size-5 text-warning" />{" "}
      </div>
    );
  }

  return (
    <div className="tooltip tooltip-left tooltip-warning" data-tip="Pending">
      <span className="tooltip-content">
        Submitted by {userMap[submission.user_id]} - Rejected by{" "}
        {userMap[submission.reviewer_id!]}
      </span>
      <XCircleIcon className="size-5 text-error" />
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
      url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtu.be"),
  );
  if (youtubeUrl) {
    return (
      <a href={youtubeUrl.href} target="_blank">
        <YoutubeFilled className="size-5" brandColor></YoutubeFilled>
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
        <TwitchFilled className="size-5 cursor-not-allowed"></TwitchFilled>
      );
    }
    return (
      <a href={twitchUrl.href} target="_blank">
        <TwitchFilled className="size-5" brandColor></TwitchFilled>
      </a>
    );
  }
  if (urls.length > 0) {
    return (
      <a href={urls[0].href} target="_blank">
        <LinkIcon className="size-5 text-blue-500"></LinkIcon>
      </a>
    );
  }
  return null;
}

export interface SubmissionCardProps {
  objective: ScoreObjective;
}

export function SubmissionCard({ objective }: SubmissionCardProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { submissions = [] } = useGetSubmissions(currentEvent.id);
  const { users } = useGetUsers(currentEvent.id);
  const [showModal, setShowModal] = useState(false);
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
    {},
  );
  const teamIds = currentEvent.teams
    .sort((a, b) => {
      if (a.id === eventStatus?.team_id) return -1;
      if (b.id === eventStatus?.team_id) return 1;
      const pointsA = objective.team_score[a.id].totalPoints();
      const pointsB = objective.team_score[b.id].totalPoints();
      if (pointsB !== pointsA) {
        return pointsB - pointsA;
      }
      return b.id - a.id;
    })
    .slice(0, preferences.limitTeams ? preferences.limitTeams : undefined)
    .map((team) => team.id);
  const canSubmit =
    eventStatus?.team_id &&
    new Date(currentEvent.event_start_time) < new Date() &&
    new Date(currentEvent.event_end_time) > new Date();
  return (
    <>
      <SubmissionDialog
        objective={objective}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <div className="card bborder bg-card shadow-xl" key={objective.id}>
        <div className="flex h-full min-h-22 items-center justify-between rounded-t-box bborder-b bg-base-300/50 px-4 py-2">
          <div
            className={twMerge(
              "w-full",
              objective.extra && "tooltip tooltip-primary",
            )}
          >
            <div className="tooltip-content max-w-75 text-xl">
              {objective.extra}
            </div>
            <h3 className="mr-4 grow text-center text-xl font-medium">
              {objective.name}
              {objective.extra ? <i className="text-error">*</i> : null}
            </h3>
          </div>
          {canSubmit && (
            <div
              className="tooltip tooltip-left lg:tooltip-top"
              data-tip="Submit Bounty"
            >
              <button
                className="rounded-full"
                onClick={() => setShowModal(true)}
              >
                <PlusCircleIcon className="size-8 cursor-pointer" />
              </button>
            </div>
          )}
        </div>
        <div className="rounded-b-box">
          <table key={objective.id} className="w-full border-collapse">
            <tbody>
              {Object.entries(objective.team_score)
                .filter(([teamId]) => teamIds.includes(parseInt(teamId)))
                .map(([teamId, score]) => {
                  return [parseInt(teamId), score] as [number, ScoreClass];
                })
                .sort(([teamIdA, scoreA], [teamIdB, scoreB]) => {
                  if (scoreB.totalPoints() !== scoreA.totalPoints()) {
                    return scoreB.totalPoints() - scoreA.totalPoints();
                  }
                  return teamIdA - teamIdB;
                })
                .map(([teamId, score], idx) => {
                  const s = submissions.filter(
                    (submission) =>
                      submission.team_id === teamId &&
                      submission.objective_id === objective.id,
                  );
                  return (
                    <tr
                      key={teamId}
                      className={
                        eventStatus?.team_id === teamId
                          ? "content-highlight bg-highlight/70"
                          : ""
                      }
                    >
                      <td
                        className={twMerge(
                          "py-1 pl-4 text-left",
                          idx === teamIds.length - 1 && "rounded-bl-xl",
                          score.totalPoints() == 0
                            ? "text-error"
                            : "text-success",
                        )}
                      >
                        {renderScore(
                          getTotalPoints(objective)[teamId],
                          getPotentialPoints(objective)[teamId],
                          currentEvent?.uses_medals,
                        )}
                        {score.number() > 1 && `(${score.number()})`}
                      </td>
                      <td
                        className={twMerge(
                          "pr-4 text-right",
                          idx === teamIds.length - 1 && "rounded-br-xl",
                        )}
                      >
                        <div className="flex items-center justify-end gap-2 rounded-br-xl">
                          <span className="">{teamMap[teamId]?.name}</span>
                          <VideoButton submissions={s} />
                          <SubmissionStatus submissions={s} userMap={userMap} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
