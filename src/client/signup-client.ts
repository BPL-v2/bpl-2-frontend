import { fetchWrapper } from "./base";
import { Signup } from "../types/signup";
import { TeamUser } from "../types/team";

export async function submitEventApplication(
  eventId: number,
  data: any
): Promise<Signup> {
  return fetchWrapper<Signup>("/events/" + eventId + "/signups/self", "PUT", {
    expected_playtime: data.playtime,
  });
}

export async function withdrawEventApplication(
  eventId: number
): Promise<Signup> {
  return fetchWrapper<Signup>("/events/" + eventId + "/signups/self", "DELETE");
}

type TeamSignupMap = {
  [teamId: number]: Signup[];
};

export async function fetchAllSignups(eventId: number): Promise<Signup[]> {
  return fetchWrapper<TeamSignupMap>(
    "/events/" + eventId + "/signups",
    "GET"
  ).then((data) =>
    Object.entries(data)
      .map(([teamId, signups]) =>
        signups.map((signup) => {
          signup.team_id = parseInt(teamId);
          return signup;
        })
      )
      .flat()
  );
}

export async function assignUsersToTeams(
  eventId: number,
  teamUsers: TeamUser[]
): Promise<void> {
  return fetchWrapper("/events/" + eventId + "/teams/users", "PUT", teamUsers);
}
