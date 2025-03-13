import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { DiscordFilled } from "@ant-design/icons";
import { ApplicationStatus, ExpectedPlayTime, Team } from "../client";
import { signupApi } from "../client/client";

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
        className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
      >
        {userTeam.name}
      </button>
    );
  }
  if (eventStatus?.application_status === ApplicationStatus.applied) {
    return (
      <div className="dropdown dropdown-bottom dropdown-end h-full ">
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
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
        <dialog
          id="my_modal_1"
          className="modal"
          open={modalOpen}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        >
          <div className="modal-box bg-base-200 border-2 border-base-100">
            <h3 className="font-bold text-lg mb-8">Apply for Event</h3>
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
              <fieldset className="fieldset w-xs bg-base-200 p-4">
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
                <label className="label">
                  <input
                    type="checkbox"
                    id="rulecheck"
                    name="rulecheck"
                    required
                  />
                  I've read the{" "}
                  <a href="/rules" target="_blank">
                    rules
                  </a>
                </label>
              </fieldset>
            </form>
            {user.discord_id ? null : (
              <div className="mt-4">
                <p>
                  You need a linked discord account and join our server to
                  apply.
                </p>
                <button className="btn btn-lg bg-discord text-white text-xl mt-4">
                  <DiscordFilled></DiscordFilled> Link Discord Account
                </button>
              </div>
            )}
            {isServerMember ? null : (
              <div className="mt-4">
                <p>Join our discord server to apply for the event.</p>
                <button className="btn bg-discord btn-lg mt-4">
                  <a href="https://discord.gg/7zBQXZqJpH" target="_blank">
                    <DiscordFilled></DiscordFilled> Join Server
                  </a>
                </button>
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
          </div>
        </dialog>
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
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
