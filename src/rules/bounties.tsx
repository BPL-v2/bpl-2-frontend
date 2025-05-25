import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

export function BountyTabRules() {
  const { scores } = useContext(GlobalStateContext);
  const objs = scores?.children.find(
    (category) => category.name === "Bounties"
  )?.children;

  if (!objs) {
    return <></>;
  }
  const bountyPoints = objs[0]?.scoring_preset?.points || [];
  return (
    <>
      <h3>Points</h3>
      <p>
        Every bounty grants <b className="text-info">{bountyPoints[0]}</b>{" "}
        points, no matter who submits it first.
      </p>
      <h3>Submitting a bounty completion</h3>
      <p>
        To submit a completion click on the plus sign icon on the race card and
        fill in the form. You will need to provide a timestamp in your local
        timezone (your browser sets this for you) and a link to a proof of your
        completion. This can for example be a screenshot or a video. If there is
        more information you need to share for the reviewers you can add it in
        the comment field.
      </p>
      <p>
        BPL staff will manually credit points for races after the verification,
        if there are questions about a race condition please confirm with a BPL
        Admin or Manager prior to beginning the map/fight.
      </p>
      <h3 className="text-warning">Notes</h3>
      <p className="text-warning">
        Each player can only submit one bounty completion. If you are part of a
        party that completed a bounty you are considered to have submitted the
        bounty too
      </p>
    </>
  );
}
