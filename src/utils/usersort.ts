// @ts-nocheck - This is way too annoying to typecheck. Sue me i dont care
import { Signup } from "../client";
import { BPLEvent } from "../types/event";

export function sortUsers(currentEvent: BPLEvent, signups: Signup[]): Signup[] {
  let suggestion = getSortSuggestion(currentEvent, signups);
  return improveFairness(suggestion, currentEvent);
}

const randSort = () => Math.random() - 0.5;

function improveFairness(signups: Signup[], currentEvent: BPLEvent) {
  // tries to balance out team sizes
  for (let i = 0; i < 100; i++) {
    const counts = getTeamCounts(signups, currentEvent);
    const minval = Math.min(...Object.values(counts));
    const maxval = Math.max(...Object.values(counts));
    if (maxval - minval <= 1) {
      // a difference of 1 between min and max can not be improved upon
      return signups;
    }
    const minTeam = Object.keys(counts).find((key) => counts[key] === minval);
    const maxTeam = Object.keys(counts).find((key) => counts[key] === maxval);
    for (const signup of signups.sort(randSort)) {
      // switch out a user from the max team to the min team
      if (signup.team_id === parseInt(maxTeam) && !signup.sorted) {
        signup.team_id = parseInt(minTeam);
        break;
      }
    }
  }
  return signups;
}

function getTeamCounts(
  signups: Signup[],
  currentEvent: BPLEvent
): { [teamId: number]: number } {
  return signups.reduce(
    (acc, signup) => {
      acc[signup.team_id]++;
      return acc;
    },
    currentEvent.teams.reduce((acc, team) => {
      acc[team.id] = 0;
      return acc;
    }, {})
  );
}

export function getSortSuggestion(currentEvent: BPLEvent, signups: Signup[]) {
  const buckets: {
    [key: string]: { [teamId: number]: number };
  } = ["0-3", "4-6", "7-9", "10-12", "13+"].reduce((buckets, playtime) => {
    buckets[playtime] = currentEvent.teams.reduce((teamNumbers, team) => {
      teamNumbers[team.id] = signups.filter(
        (signup) =>
          signup.team_id === team.id && signup.expected_playtime === playtime
      ).length;
      return teamNumbers;
    }, {});
    return buckets;
  }, {} as { [key in keyof typeof PlayTime]: { [teamId: number]: number } });
  buckets["total"] = currentEvent.teams.reduce((teamNumbers, team) => {
    teamNumbers[team.id] = signups.filter(
      (signup) => signup.team_id === team.id
    ).length;
    return teamNumbers;
  });

  const newSignups = [];

  for (const signup of signups.slice().sort(randSort)) {
    if (signup.team_id !== 0) {
      newSignups.push(signup);
      continue;
    }
    let minval = Math.min(...Object.values(buckets[signup.expected_playtime]));
    let minteam = Object.keys(buckets[signup.expected_playtime])
      .filter(
        (key) => buckets[signup.expected_playtime][parseInt(key)] === minval
      )
      .sort(randSort)
      .sort((a, b) => {
        return buckets["total"][parseInt(a)] - buckets["total"][parseInt(b)];
      })[0];
    newSignups.push({ ...signup, team_id: parseInt(minteam) });
    buckets[signup.expected_playtime][parseInt(minteam)] += 1;
    buckets["total"][parseInt(minteam)] += 1;
  }
  return newSignups;
}
