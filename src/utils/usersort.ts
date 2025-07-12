import { Event } from "@client/api";
import { ExtendedSignup } from "src/routes/admin/team-sort";

export function sortUsers(
  currentEvent: Event,
  signups: ExtendedSignup[]
): ExtendedSignup[] {
  const lockedSignups = signups.reduce(
    (acc, signup) => {
      if (signup.team_id) {
        acc[signup.user.id] = signup.team_id;
      }
      return acc;
    },
    {} as { [userId: number]: number }
  );
  console.log("lockedSignups", lockedSignups);
  let suggestion = getSortSuggestion(currentEvent, signups);
  suggestion = improveFairness(suggestion, currentEvent, lockedSignups);
  suggestion = ensurePartners(suggestion, lockedSignups);
  suggestion = improveFairness(suggestion, currentEvent, lockedSignups);
  return suggestion;
}

const playtimeBuckets = ["0-3", "4-6", "7-9", "10-12", "13+"];
function toBucket(
  expectedPlaytime: number
): "0-3" | "4-6" | "7-9" | "10-12" | "13+" {
  if (expectedPlaytime < 4) {
    return "0-3";
  } else if (expectedPlaytime < 7) {
    return "4-6";
  } else if (expectedPlaytime < 10) {
    return "7-9";
  } else if (expectedPlaytime < 13) {
    return "10-12";
  } else {
    return "13+";
  }
}

const randSort = () => Math.random() - 0.5;

function ensurePartners(
  signups: ExtendedSignup[],
  lockedSignups: { [userId: number]: number }
) {
  const fixedSignups = [];
  const userToSignup = new Map<number, ExtendedSignup>();
  const teamToSignups = new Map<number, ExtendedSignup[]>();
  const matchedPartners = new Set<number>();
  for (const signup of signups) {
    userToSignup.set(signup.user.id, signup);
    if (signup.team_id) {
      teamToSignups.set(signup.team_id, [
        ...(teamToSignups.get(signup.team_id) || []),
        signup,
      ]);
    }
  }

  for (const signup of signups) {
    if (signup.partner_id) {
      const partnerSignup = userToSignup.get(signup.partner_id);
      if (
        partnerSignup &&
        partnerSignup.team_id &&
        partnerSignup.team_id === signup.team_id
      ) {
        matchedPartners.add(signup.partner_id);
        matchedPartners.add(signup.user.id);
      }
    }
  }

  for (const signup of signups) {
    if (
      lockedSignups[signup.user.id] ||
      !signup.partner_id ||
      matchedPartners.has(signup.user.id)
    ) {
      fixedSignups.push(signup);
      continue;
    }
    const partnerSignup = userToSignup.get(signup.partner_id);
    if (
      partnerSignup &&
      partnerSignup.team_id &&
      partnerSignup.partner_id === signup.user.id
    ) {
      let bestFittingUserId = -1;
      let bestFittingPlaytimeDiff = 1000000;
      for (const signup2 of teamToSignups.get(partnerSignup.team_id) || []) {
        if (lockedSignups[signup2.user.id] || signup2.partner_id) {
          continue;
        }
        const playtimeDiff = Math.abs(
          signup.expected_playtime - signup2.expected_playtime
        );
        if (
          playtimeDiff < bestFittingPlaytimeDiff &&
          !lockedSignups[signup2.user.id]
        ) {
          bestFittingUserId = signup2.user.id;
          bestFittingPlaytimeDiff = playtimeDiff;
        }
      }
      fixedSignups.push({ ...signup, team_id: partnerSignup.team_id });
      matchedPartners.add(signup.user.id);
      matchedPartners.add(signup.partner_id);
    } else {
      fixedSignups.push(signup);
    }
  }
  return fixedSignups as ExtendedSignup[];
}

function improveFairness(
  signups: ExtendedSignup[],
  currentEvent: Event,
  lockedSignups: { [userId: number]: number }
) {
  // tries to balance out team sizes
  for (let i = 0; i < 100; i++) {
    const counts = getTeamCounts(signups, currentEvent);
    const minval = Math.min(...Object.values(counts));
    const maxval = Math.max(...Object.values(counts));
    if (maxval - minval <= 1) {
      // a difference of 1 between min and max can not be improved upon
      return signups;
    }
    const minTeam = Object.keys(counts).find(
      (key) => counts[parseInt(key)] === minval
    );
    const maxTeam = Object.keys(counts).find(
      (key) => counts[parseInt(key)] === maxval
    );
    for (const signup of signups.sort(randSort)) {
      if (lockedSignups[signup.user.id] || signup.partner_id) {
        continue;
      }
      // switch out a user from the max team to the min team
      if (
        maxTeam &&
        minTeam &&
        signup.team_id === parseInt(maxTeam) &&
        !signup.sorted &&
        !lockedSignups[signup.user.id]
      ) {
        signup.team_id = parseInt(minTeam);
        break;
      }
    }
  }

  return signups;
}

function getTeamCounts(
  signups: ExtendedSignup[],
  currentEvent: Event
): { [teamId: number]: number } {
  return signups.reduce(
    (acc, signup) => {
      if (signup.team_id) {
        acc[signup.team_id]++;
      }
      return acc;
    },
    currentEvent.teams.reduce(
      (acc, team) => {
        acc[team.id] = 0;
        return acc;
      },
      {} as { [teamId: number]: number }
    )
  );
}

export function getSortSuggestion(
  currentEvent: Event,
  signups: ExtendedSignup[]
) {
  const buckets: {
    [key: string]: { [teamId: number]: number };
  } = playtimeBuckets.reduce(
    (buckets, playtime) => {
      buckets[playtime] = currentEvent.teams.reduce(
        (teamNumbers, team) => {
          teamNumbers[team.id] = signups.filter(
            (signup) =>
              signup.team_id === team.id &&
              signup.expected_playtime === parseInt(playtime)
          ).length;
          return teamNumbers;
        },
        {} as { [teamId: number]: number }
      );
      return buckets;
    },
    {} as { [key: string]: { [teamId: number]: number } }
  );
  buckets["total"] = currentEvent.teams.reduce(
    (teamNumbers, team) => {
      teamNumbers[team.id] = signups.filter(
        (signup) => signup.team_id === team.id
      ).length;
      return teamNumbers;
    },
    {} as { [teamId: number]: number }
  );
  const newSignups = [];

  for (const signup of signups.slice().sort(randSort)) {
    if (signup.team_id) {
      newSignups.push(signup);
      continue;
    }
    const bucket = buckets[toBucket(signup.expected_playtime)];
    const minval = Math.min(...Object.values(bucket));
    const minteam = Object.keys(bucket)
      .filter((key) => bucket[parseInt(key)] === minval)
      .sort(randSort)
      .sort((a, b) => {
        return buckets["total"][parseInt(a)] - buckets["total"][parseInt(b)];
      })[0];
    newSignups.push({ ...signup, team_id: parseInt(minteam) });
    bucket[parseInt(minteam)] += 1;
    buckets["total"][parseInt(minteam)] += 1;
  }
  return newSignups;
}
