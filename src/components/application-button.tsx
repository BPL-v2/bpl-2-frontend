import React, { useContext, useMemo } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ApplicationStatus } from "@client/api";
import { DiscordFilled } from "@icons/discord";
import { Dialog } from "./dialog";
import { Link, useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";
import { TeamName } from "./team-name";
import {
  useCreateSignup,
  useDeleteSignup,
  useGetEventStatus,
  useGetUser,
} from "@client/query";
import { useQueryClient } from "@tanstack/react-query";

const ApplicationButton = () => {
  const { currentEvent } = useContext(GlobalStateContext);
  const state = useRouterState();
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [hourValue, setHourValue] = React.useState(1);
  const [needHelp, setNeedHelp] = React.useState(false);
  const [wantToHelp, setWantToHelp] = React.useState(false);
  const qc = useQueryClient();
  const { user, isLoading: userLoading, isError: userError } = useGetUser();
  const {
    eventStatus,
    isLoading: eventStatusLoading,
    isError: eventStatusError,
  } = useGetEventStatus(currentEvent.id);
  const { deleteSignup } = useDeleteSignup(qc);
  const { createSignup, isError: signupError } = useCreateSignup(qc);

  const userTeam = useMemo(() => {
    return (
      user &&
      currentEvent?.teams.find((team) => team.id === eventStatus?.team_id)
    );
  }, [eventStatus, user, currentEvent]);
  if (
    userLoading ||
    eventStatusLoading ||
    userError ||
    eventStatusError ||
    currentEvent.application_start_time > new Date().toISOString()
  ) {
    return null;
  }

  if (userTeam) {
    return <TeamName team={userTeam} className="text-lg p-4 " />;
  }
  if (eventStatus?.application_status === ApplicationStatus.applied) {
    return (
      <div className="dropdown">
        <button className={`btn btn-lg py-8 hover:btn-primary`}>
          Signup Successful
        </button>
        <ul
          tabIndex={0}
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
              onClick={() => deleteSignup(currentEvent.id)}
            >
              Withdraw Application
            </div>
          </li>
        </ul>
      </div>
    );
  }

  if (
    new Date() > new Date(currentEvent.application_end_time) ||
    new Date() < new Date(currentEvent.application_start_time)
  ) {
    return;
  }
  if (eventStatus?.application_status === ApplicationStatus.none) {
    return (
      <>
        <Dialog title="Apply for Event" open={modalOpen} setOpen={setModalOpen}>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              if (!user?.discord_id) {
                alert("You need to link your Discord account to apply.");
                return;
              }
              createSignup({
                eventId: currentEvent.id,
                body: {
                  expected_playtime: hourValue,
                  wants_to_help: wantToHelp,
                  needs_help: needHelp,
                },
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
                  id="need_help"
                  name="need_help"
                  className="checkbox"
                  onChange={(e) => {
                    setNeedHelp(e.target.checked);
                    setWantToHelp(false);
                  }}
                  checked={needHelp}
                />
                I'm new and would like to have help
              </label>
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  id="want_to_help"
                  name="want_to_help"
                  className="checkbox"
                  onChange={(e) => {
                    setWantToHelp(e.target.checked);
                    setNeedHelp(false);
                  }}
                  checked={wantToHelp}
                />
                I'm experienced and would like to help others
              </label>
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
          {user?.discord_id ? null : (
            <div className="mt-4">
              <p>
                You need a linked discord account and join our server to apply.
              </p>
              <a
                className="btn btn-lg bg-discord text-white text-xl mt-4"
                onClick={redirectOauth("discord", state.location.href)}
              >
                <DiscordFilled className="w-6 h-6" />
                Link Discord account
              </a>
            </div>
          )}
          {signupError ? null : (
            <div className="mt-4">
              <p>Join our discord server to apply for the event.</p>
              <a href="https://discord.com/invite/3weG9JACgb" target="_blank">
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
