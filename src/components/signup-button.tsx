import React, { useContext, useMemo } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ApplicationStatus } from "@client/api";
import { DiscordFilled } from "@icons/discord";
import { Dialog } from "./dialog";
import { Link, useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";
import { TeamName } from "./team/team-name";
import {
  useCreateSignup,
  useDeleteSignup,
  useGetEvents,
  useGetEventStatus,
  useGetOwnSignup,
  useGetUser,
} from "@client/query";
import { useQueryClient } from "@tanstack/react-query";

const SignupButton = () => {
  const { currentEvent } = useContext(GlobalStateContext);
  const state = useRouterState();
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [hourValue, setHourValue] = React.useState(1);
  const [needHelp, setNeedHelp] = React.useState(false);
  const [wantToHelp, setWantToHelp] = React.useState(false);
  const qc = useQueryClient();
  const { user, isLoading: userLoading, isError: userError } = useGetUser();
  const { events } = useGetEvents();
  const upcomingEvent =
    events?.sort((a, b) => {
      return (
        (Date.parse(b.event_start_time) || 0) -
        (Date.parse(a.event_start_time) || 0)
      );
    })[0] || currentEvent;
  const { eventStatus, isError: eventStatusError } = useGetEventStatus(
    upcomingEvent.id,
  );
  const { signup } = useGetOwnSignup(upcomingEvent.id);
  const { deleteSignup } = useDeleteSignup(qc);
  const { createSignup, isError: signupError } = useCreateSignup(
    qc,
    () => setModalOpen(false),
    (error) => alert(error),
  );

  const dialog = useMemo(() => {
    return (
      <Dialog title="Apply for Event" open={modalOpen} setOpen={setModalOpen}>
        <form
          className="w-full"
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const partnerName = formData.get("partner_name") as string;
            if (!user?.discord_id) {
              alert("You need to link your Discord account to apply.");
              return;
            }
            createSignup({
              eventId: upcomingEvent.id,
              body: {
                expected_playtime: hourValue,
                wants_to_help: wantToHelp,
                needs_help: needHelp,
                partner_account_name: partnerName,
                extra:
                  formData.get("extra") === "on"
                    ? JSON.stringify({ guild_owner: true })
                    : undefined,
              },
            });
          }}
        >
          <fieldset className="fieldset gap-4 rounded-box bg-base-300 p-4">
            <label className="fieldset-label">
              How many hours will you be able to play per day?
            </label>
            <div className="flex items-center gap-2">
              <span className="w-6 text-lg text-base-content">{hourValue}</span>
              <div className="w-full">
                <input
                  type="range"
                  min={1}
                  max="24"
                  value={hourValue}
                  className="range w-full range-primary"
                  step="1"
                  onChange={(e) => {
                    setHourValue(parseInt(e.target.value));
                  }}
                />
              </div>
            </div>
            <label className="fieldset-label">
              Do you want to play with another person? (PoE account name
              required)
            </label>
            <div className=" w-full">
              <input
                name="partner_name"
                type="text"
                className="input input-bordered w-full bg-base-200"
              />
            </div>
            {/* <label className="fieldset-label text-info">
              <input
                type="checkbox"
                id="extra"
                name="extra"
                className="checkbox checkbox-info"
              />
              Are you owner of a guild with unlocked guild stashes?
            </label> */}
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
                defaultChecked={!!signup}
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
              className="bg-discord btn mt-4 text-xl text-white btn-lg"
              onClick={redirectOauth("discord", state.location.href)}
            >
              <DiscordFilled className="size-6" />
              Link Discord account
            </a>
          </div>
        )}
        {signupError ? null : (
          <div className="mt-4">
            <p>
              Join our{" "}
              <a
                href="https://discord.com/invite/3weG9JACgb"
                target="_blank"
                className="link link-info"
              >
                discord server
              </a>{" "}
              to apply for the event.
            </p>
          </div>
        )}
        <div className="modal-action w-full">
          <button
            className="btn btn-outline btn-soft"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            Cancel
          </button>{" "}
          <button
            className="btn btn-primary"
            onClick={() => formRef.current?.requestSubmit()}
          >
            Apply
          </button>
        </div>
      </Dialog>
    );
  }, [modalOpen, upcomingEvent.id, hourValue, needHelp, wantToHelp, signup]);

  const userTeam = useMemo(() => {
    return (
      user &&
      upcomingEvent?.teams.find((team) => team.id === eventStatus?.team_id)
    );
  }, [eventStatus, user, upcomingEvent]);

  if (
    !user ||
    userLoading ||
    userError ||
    eventStatusError ||
    new Date(upcomingEvent.application_start_time) > new Date()
  ) {
    return null;
  }

  if (userTeam) {
    return (
      <span className="text-2xl">
        Sorted with <TeamName team={userTeam} className="font-bold" />
      </span>
    );
  }
  if (eventStatus?.application_status === ApplicationStatus.waitlisted) {
    return (
      "Waitlist position: " +
      (eventStatus.number_of_signups_before - currentEvent.max_size + 1)
    );
  }

  if (eventStatus?.application_status === ApplicationStatus.applied) {
    return (
      <>
        {dialog}
        <div className="dropdown">
          <button className={"cursor-pointer underline"}>
            <span className="text-2xl">
              Signed up {eventStatus?.partner && "with "}
            </span>
            {eventStatus?.partner && (
              <span className="text-info">{eventStatus?.partner}</span>
            )}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-1 rounded-field border-2 border-base-100 bg-base-300 text-lg shadow-2xl"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement?.blur();
              }
            }}
          >
            <li>
              <div
                className={
                  "text-warning hover:bg-warning hover:text-warning-content"
                }
                onClick={() => {
                  setHourValue(signup?.expected_playtime ?? 1);
                  setNeedHelp(signup?.needs_help ?? false);
                  setWantToHelp(signup?.wants_to_help ?? false);
                  setModalOpen(true);
                }}
              >
                Edit Application
              </div>
              <div
                className={"text-error hover:bg-error hover:text-error-content"}
                onClick={() =>
                  deleteSignup({ eventId: upcomingEvent.id, userId: user.id })
                }
              >
                Withdraw Application
              </div>
            </li>
          </ul>
        </div>
      </>
    );
  }

  if (
    new Date() > new Date(upcomingEvent.application_end_time) ||
    new Date() < new Date(upcomingEvent.application_start_time)
  ) {
    return;
  }
  if (eventStatus?.application_status === ApplicationStatus.none) {
    return (
      <>
        {dialog}
        <button
          className={"btn btn-lg btn-primary"}
          onClick={() => setModalOpen(true)}
        >
          Apply for Event
        </button>
      </>
    );
  }
};

export default SignupButton;
