import { Event } from "@client/api";
import { SortedSignup } from "../routes/admin/team-sort";

export type SortBucketConfig = {
  bucketKeys: string[];
  totalBucketKey: string;
  getSignupBuckets: (signup: SortedSignup) => string[];
};

export function sortUsers(
  currentEvent: Event,
  signups: SortedSignup[],
  bucketConfig: SortBucketConfig,
): SortedSignup[] {
  const lockedSignups = signups.reduce(
    (acc, signup) => {
      if (signup.team_id) {
        acc[signup.user.id] = signup.team_id;
      }
      return acc;
    },
    {} as { [userId: number]: number },
  );
  let suggestion = getSortSuggestion(currentEvent, signups, bucketConfig);
  suggestion = improveFairness(suggestion, currentEvent, lockedSignups);
  suggestion = ensurePartners(suggestion, lockedSignups);
  suggestion = improveFairness(suggestion, currentEvent, lockedSignups);
  return suggestion;
}

const randSort = () => Math.random() - 0.5;

function ensurePartners(
  signups: SortedSignup[],
  lockedSignups: { [userId: number]: number },
) {
  const fixedSignups = [];
  const userToSignup = new Map<number, SortedSignup>();
  const teamToSignups = new Map<number, SortedSignup[]>();
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
      let bestFittingPlaytimeDiff = 1000000;
      for (const signup2 of teamToSignups.get(partnerSignup.team_id) || []) {
        if (lockedSignups[signup2.user.id] || signup2.partner_id) {
          continue;
        }
        const playtimeDiff = Math.abs(
          signup.expected_playtime - signup2.expected_playtime,
        );
        if (
          playtimeDiff < bestFittingPlaytimeDiff &&
          !lockedSignups[signup2.user.id]
        ) {
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
  return fixedSignups as SortedSignup[];
}

function improveFairness(
  signups: SortedSignup[],
  currentEvent: Event,
  lockedSignups: { [userId: number]: number },
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
      (key) => counts[parseInt(key)] === minval,
    );
    const maxTeam = Object.keys(counts).find(
      (key) => counts[parseInt(key)] === maxval,
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
  signups: SortedSignup[],
  currentEvent: Event,
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
      {} as { [teamId: number]: number },
    ),
  );
}

export function getSortSuggestion(
  currentEvent: Event,
  signups: SortedSignup[],
  bucketConfig: SortBucketConfig,
) {
  const teamIds = currentEvent.teams.map((team) => team.id);
  const allBucketKeys = bucketConfig.bucketKeys;
  const totalBucketKey = bucketConfig.totalBucketKey;

  const buckets = allBucketKeys.reduce(
    (acc, bucketKey) => {
      acc[bucketKey] = teamIds.reduce(
        (teamNumbers, teamId) => {
          teamNumbers[teamId] = 0;
          return teamNumbers;
        },
        {} as { [teamId: number]: number },
      );
      return acc;
    },
    {} as { [key: string]: { [teamId: number]: number } },
  );

  const bucketTotals = allBucketKeys.reduce(
    (acc, bucketKey) => {
      acc[bucketKey] = 0;
      return acc;
    },
    {} as { [key: string]: number },
  );

  const addSignupToBuckets = (teamId: number, bucketKeys: string[]) => {
    for (const bucketKey of bucketKeys) {
      buckets[bucketKey][teamId] += 1;
      bucketTotals[bucketKey] += 1;
    }
  };

  for (const signup of signups) {
    if (!signup.team_id) {
      continue;
    }
    const bucketKeys = bucketConfig.getSignupBuckets(signup);
    addSignupToBuckets(signup.team_id, bucketKeys);
  }

  const newSignups = [];

  for (const signup of signups.slice().sort(randSort)) {
    if (signup.team_id) {
      newSignups.push(signup);
      continue;
    }
    const signupBuckets = bucketConfig.getSignupBuckets(signup);

    let bestTeamId: number | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const teamId of teamIds) {
      let score = 0;
      for (const bucketKey of allBucketKeys) {
        const extraTotal = signupBuckets.includes(bucketKey) ? 1 : 0;
        const target = (bucketTotals[bucketKey] + extraTotal) / teamIds.length;
        for (const candidateTeamId of teamIds) {
          const extra =
            candidateTeamId === teamId && signupBuckets.includes(bucketKey)
              ? 1
              : 0;
          const diff = buckets[bucketKey][candidateTeamId] + extra - target;
          score += diff * diff;
        }
      }

      if (score < bestScore) {
        bestScore = score;
        bestTeamId = teamId;
        continue;
      }
      if (score === bestScore && bestTeamId !== null) {
        if (
          buckets[totalBucketKey][teamId] < buckets[totalBucketKey][bestTeamId]
        ) {
          bestTeamId = teamId;
        }
      }
    }

    const assignedTeamId = bestTeamId ?? teamIds[0];
    newSignups.push({ ...signup, team_id: assignedTeamId });
    addSignupToBuckets(assignedTeamId, signupBuckets);
  }
  return newSignups;
}
