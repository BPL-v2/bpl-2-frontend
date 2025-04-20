import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ApplicationStatus, Team } from "@client/api";
import { signupApi } from "@client/client";
import { DiscordFilled } from "@icons/discord";
import { Dialog } from "./dialog";
import { Link } from "@tanstack/react-router";

type ApplicationButtonProps = {};
const ApplicationButton = ({}: ApplicationButtonProps) => {
  let { user, eventStatus, currentEvent, setEventStatus } =
    useContext(GlobalStateContext);
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [userTeam, setUserTeam] = React.useState<Team | undefined>(undefined);
  const [isServerMember, setIsServerMember] = React.useState(true);
  const [hourValue, setHourValue] = React.useState(1);
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
    return <button className={`text-lg p-4 `}>{userTeam.name}</button>;
  }
  if (eventStatus?.application_status === ApplicationStatus.applied) {
    return (
      <div className="dropdown">
        <button
          className={`btn btn-lg py-8 border-0 text-base-content hover:text-primary-content hover:bg-primary`}
        >
          Application Pending
        </button>

        <ul
          tabIndex={0}
          // className={`btn btn-lg py-8 border-0 text-base-content hover:text-primary-content hover:bg-primary`}

          className="dropdown-content menu bg-base-300 border-2 border-base-100 z-1 shadow-2xl text-lg rounded-field"
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
              signupApi
                .createSignup(currentEvent.id, {
                  expected_playtime: hourValue,
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
            <fieldset className="fieldset bg-base-300 p-4 rounded-box gap-4  w-full">
              <label className="fieldset-label">
                How many hours will you be able to play per day?
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-base-content w-6">
                  {hourValue}
                </span>
                <div className=" w-full">
                  <input
                    type="range"
                    min={1}
                    max="24"
                    defaultValue={hourValue}
                    className="range range-primary w-full"
                    step="1"
                    onChange={(e) => {
                      setHourValue(parseInt(e.target.value));
                    }}
                  />
                </div>
              </div>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  id="rulecheck"
                  name="rulecheck"
                  className="checkbox"
                  required
                />
                I've read the
                <Link to="/rules" target="_blank" className="link link-info">
                  rules
                </Link>
              </label>
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
          className={`btn btn-lg py-8 border-0 text-base-content hover:text-primary-content hover:bg-primary`}
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
