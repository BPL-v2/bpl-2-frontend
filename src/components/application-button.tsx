import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { ApplicationStatus, ExpectedPlayTime, Team } from "../client";
import { signupApi } from "../client/client";
import { DiscordFilled } from "../icons/discord";
import { Dialog } from "./dialog";

type ApplicationButtonProps = {};
const ApplicationButton = ({}: ApplicationButtonProps) => {
  let { user, eventStatus, currentEvent, setEventStatus } =
    useContext(GlobalStateContext);
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [userTeam, setUserTeam] = React.useState<Team | undefined>(undefined);
  const [isServerMember, setIsServerMember] = React.useState(true);
  useEffect(() => {
    setUserTeam(
      user
        ? currentEvent?.teams.find((team) => team.id === eventStatus?.team_id)
        : undefined
    );
  }, [eventStatus, user]);
  if (
    !user ||
    !currentEvent ||
    currentEvent.application_start_time > new Date().toISOString()
  ) {
    return null;
  }
  if (userTeam) {
    return (
      <button
        className={`btn bg-base-100 h-full hover:text-primary hover:border-primary rounded-none`}
      >
        {userTeam.name}
      </button>
    );
  }
  if (eventStatus?.application_status === ApplicationStatus.applied) {
    return (
      <div className="dropdown dropdown-bottom dropdown-end h-full">
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary rounded-none`}
        >
          Application Pending
        </button>

        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-300 min-w-[100%] z-1 shadow-sm text-base-content"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement?.blur();
            }
          }}
        >
          <li>
            <div
              className={`text-error hover:bg-error hover:text-error-content`}
              onClick={() => {
                signupApi.deleteSignup(currentEvent.id).then(() => {
                  setEventStatus({
                    ...eventStatus,
                    application_status: ApplicationStatus.none,
                  });
                });
              }}
            >
              Withdraw Application
            </div>
          </li>
        </ul>
      </div>
    );
  }

  if (eventStatus?.application_status === ApplicationStatus.none) {
    return (
      <>
        <Dialog title="Apply for Event" open={modalOpen} setOpen={setModalOpen}>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              signupApi
                .createSignup(currentEvent.id, {
                  expected_playtime: formData.get(
                    "expected_playtime"
                  ) as ExpectedPlayTime,
                })
                .then(() => {
                  setEventStatus({
                    ...eventStatus,
                    application_status: ApplicationStatus.applied,
                  });
                  setModalOpen(false);
                })
                .catch((e) => {
                  if (e.status === 403) {
                    setIsServerMember(false);
                  }
                });
            }}
          >
            <fieldset className="fieldset bg-base-300 p-4 rounded-box">
              <label className="fieldset-label">
                How many hours will you be able to play per day?
              </label>
              <select
                className="select"
                id="expected_playtime"
                name="expected_playtime"
              >
                {Object.entries(ExpectedPlayTime).map((entry) => (
                  <option key={entry[0]} value={entry[0]}>
                    {entry[1]}
                  </option>
                ))}
              </select>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  id="rulecheck"
                  name="rulecheck"
                  className="checkbox"
                  required
                />
                I've read the
                <a href="/rules" target="_blank" className="link link-info">
                  rules
                </a>
              </label>
              <legend className="fieldset-legend">Login options</legend>
            </fieldset>
          </form>
          {user.discord_id ? null : (
            <div className="mt-4">
              <p>
                You need a linked discord account and join our server to apply.
              </p>
              <button className="btn btn-lg bg-discord text-white text-xl mt-4">
                <DiscordFilled className="w-6 h-6" />
                Link Discord account
              </button>
            </div>
          )}
          {isServerMember ? null : (
            <div className="mt-4">
              <p>Join our discord server to apply for the event.</p>
              <a href="https://discord.gg/JVZVKSck" target="_blank">
                <button className="btn btn-lg bg-discord text-white text-xl mt-4">
                  <DiscordFilled className="w-6 h-6" />
                  Join Server
                </button>
              </a>
            </div>
          )}
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={() => formRef.current?.requestSubmit()}
            >
              Apply
            </button>
            <button
              className="btn btn-soft"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </Dialog>
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary rounded-none`}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          Apply for Event
        </button>
      </>
    );
  }
};

export default ApplicationButton;
