import { signupApi } from "@client/client";
import { useGetOwnSignup } from "@client/query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";

export const Route = createFileRoute("/played")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { signup } = useGetOwnSignup(currentEvent.id);
  if (!signup) {
    return (
      <Link to="/" className="text-2xl">
        Only players who signed up for the event can see this page.
      </Link>
    );
  }
  return (
    <div className="prose max-w-full p-4 text-left">
      <h1>Hey! Hope you had fun this BPL!</h1>
      <p>
        We are currently trying to make sure we are having more equal teams in
        terms of player activity in the future.
      </p>
      <p>
        You said you were planning to play for {signup.expected_playtime} hours
        per day. What was your actual /played in the end?
      </p>
      <form
        className="flex flex-row items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const values = new FormData(e.currentTarget);
          const days = Number(values.get("days"));
          const hours = Number(values.get("hours"));
          const totalHours = days * 24 + hours;
          signupApi
            .reportPlaytime(currentEvent.id, {
              actual_playtime: totalHours,
            })
            .then(() => {
              alert("Thank you for your feedback!");
              window.location.href = "/";
              e.currentTarget.reset();
            });
        }}
      >
        <label className="input">
          <span className="label text-white">Days</span>
          <input name="days" type="number" />
        </label>
        <label className="input">
          <span className="label text-white">Hours</span>
          <input name="hours" type="number" />
        </label>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      <p className="text-error">
        We know its very funny to put in absurd numbers, but please be honest
        this time around and help us make this an even better experience for all
      </p>
    </div>
  );
}
