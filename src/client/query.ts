import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { isLoggedIn } from "@utils/token";
import { ScoreMap } from "@utils/utils";
import { BulkObjectiveCreate } from "../routes/admin/events/$eventId/categories.$categoryId";
import {
  Character,
  EventCreate,
  GuildStashTab,
  ItemField,
  JobType,
  NumberField,
  ObjectiveCreate,
  ObjectiveType,
  Operator,
  ScoringPresetCreate,
  SignupCreate,
  SubmissionCreate,
  TeamCreate,
  TeamSuggestion,
  TeamUserCreate,
} from "./api";
import {
  activityApi,
  characterApi,
  eventApi,
  guildStashApi,
  jobApi,
  ladderApi,
  objectiveApi,
  scoresApi,
  scoringApi,
  signupApi,
  streamApi,
  submissionApi,
  teamApi,
  userApi,
} from "./client";

let current = 0;

export function useGetEvents() {
  const query = useQuery({
    queryKey: ["events"],
    queryFn: async () =>
      eventApi.getEvents().then((events) => {
        events.forEach((event) => {
          if (event.is_current) {
            current = event.id;
          }
        });
        return events.sort((a, b) => a.id - b.id);
      }),
  });
  return {
    ...query,
    events: query.data,
  };
}

export function useGetLadder(eventId: number) {
  const query = useQuery({
    queryKey: ["ladder", current !== eventId ? eventId : "current"],
    queryFn: async () => ladderApi.getLadder(eventId),
    refetchInterval: 60 * 1000,
    staleTime: 60 * 1000,
  });
  return {
    ...query,
    ladder: query.data,
  };
}

export function useGetUsers(eventId: number) {
  const query = useQuery({
    queryKey: ["users", current !== eventId ? eventId : "current"],
    queryFn: async () =>
      userApi.getUsersForEvent(eventId).then((users) => {
        return Object.entries(users)
          .map(([teamId, user]) => {
            return user.map((u) => ({ ...u, team_id: parseInt(teamId) }));
          })
          .flat();
      }),
    refetchOnMount: false,
  });
  return {
    ...query,
    users: query.data,
  };
}

export function useGetStreams(eventId: number) {
  const query = useQuery({
    queryKey: ["streams", current !== eventId ? eventId : "current"],
    queryFn: async () => streamApi.getStreams(eventId),
  });
  return {
    ...query,
    streams: query.data,
  };
}

export function useGetEventStatus(eventId: number) {
  const query = useQuery({
    queryKey: ["eventStatus", current !== eventId ? eventId : "current"],
    queryFn: async () => eventApi.getEventStatus(eventId),
    refetchOnMount: false,
  });
  return {
    ...query,
    eventStatus: query.data,
  };
}

export function useGetSignups(eventId: number) {
  const query = useQuery({
    queryKey: ["signups", current !== eventId ? eventId : "current"],
    queryFn: async () => signupApi.getEventSignups(eventId),
  });
  return {
    ...query,
    signups: query.data,
  };
}

export function useGetOwnSignup(eventId: number) {
  const query = useQuery({
    queryKey: ["ownSignup", current !== eventId ? eventId : "current"],
    queryFn: async () => signupApi.getPersonalSignup(eventId),
    retry: false,
    enabled: isLoggedIn(),
    refetchOnMount: false,
  });
  return {
    signup: query.data,
  };
}

export function useCreateSignup(
  qc: QueryClient,
  successCallback?: () => void,
  errorCallback?: (msg: string) => void,
) {
  const m = useMutation({
    mutationFn: ({ eventId, body }: { eventId: number; body: SignupCreate }) =>
      signupApi.createSignup(eventId, body),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: [
          "eventStatus",
          current !== variables.eventId ? variables.eventId : "current",
        ],
      });
      qc.setQueryData(
        [
          "ownSignup",
          current !== variables.eventId ? variables.eventId : "current",
        ],
        data,
      );
      if (successCallback) {
        successCallback();
      }
    },
    onError: async (error) => {
      if (errorCallback) {
        let errorMessage = "An error occurred";
        if (error instanceof Response) {
          try {
            const errorData = await error.json();
            errorMessage = errorData.error;
          } catch {
            errorMessage = `HTTP ${error.status}: ${error.statusText}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        errorCallback(errorMessage);
      }
    },
  });
  return {
    ...m,
    createSignup: m.mutate,
    createSignupPending: m.isPending,
  };
}

export function useDeleteSignup(qc: QueryClient) {
  const m = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: number; userId: number }) =>
      signupApi.deleteSignup(eventId, userId),
    onSuccess: (_, { eventId }: { eventId: number; userId: number }) => {
      qc.invalidateQueries({
        queryKey: ["eventStatus", current !== eventId ? eventId : "current"],
      });
      qc.invalidateQueries({
        queryKey: ["signups", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    deleteSignup: m.mutate,
    deleteSignupPending: m.isPending,
  };
}

export function useAddUsersToTeams(qc: QueryClient) {
  const m = useMutation({
    mutationFn: ({
      eventId,
      users,
    }: {
      eventId: number;
      users: TeamUserCreate[];
    }) => teamApi.addUsersToTeams(eventId, users),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          "signups",
          current !== variables.eventId ? variables.eventId : "current",
        ],
      });
    },
  });
  return {
    addUsersToTeams: m.mutate,
    addUsersToTeamsPending: m.isPending,
  };
}

export function useGetRules(eventId: number) {
  const query = useQuery({
    queryKey: ["rules", current !== eventId ? eventId : "current"],
    queryFn: async () => objectiveApi.getObjectiveTreeForEvent(eventId),
    refetchOnMount: false,
  });
  return {
    ...query,
    rules: query.data,
  };
}

export function useGetScoringPresets(eventId: number) {
  const query = useQuery({
    queryKey: ["scoringPresets", current !== eventId ? eventId : "current"],
    queryFn: async () => scoringApi.getScoringPresetsForEvent(eventId),
  });
  return {
    ...query,
    scoringPresets: query.data,
  };
}

export function useGetUser() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => userApi.getUser(),
    enabled: () => isLoggedIn(),
    refetchOnMount: false,
  });
  return {
    ...query,
    user: query.data,
  };
}

export function useGetUserById(userId: number) {
  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
  });
  return {
    ...query,
    user: query.data,
  };
}

export function useGetUserCharacters(userId: number) {
  const query = useQuery({
    queryKey: ["userCharacters", userId],
    queryFn: () =>
      characterApi.getUserCharacters(userId).then((data) => {
        const eventCharacters = data.reduce(
          (acc, character) => {
            if (!acc[character.event_id]) {
              acc[character.event_id] = [];
            }
            acc[character.event_id].push(character);
            return acc;
          },
          {} as { [eventId: number]: Character[] },
        );
        return Object.values(eventCharacters).map((characters) => {
          return characters.sort((a, b) => b.level - a.level)[0];
        });
      }),
    enabled: !!userId,
    refetchOnMount: false,
  });
  return {
    ...query,
    userCharacters: query.data,
  };
}

export function useGetCharacterTimeseries(characterId: string, userId: number) {
  const query = useQuery({
    queryKey: ["characterTimeseries", characterId, userId],
    queryFn: () =>
      characterApi
        .getCharacterHistory(userId, characterId)
        .then((data) => data.sort((a, b) => a.timestamp - b.timestamp)),
    enabled: !!userId && !!characterId,
    staleTime: 5 * 60 * 1000,
  });
  return {
    ...query,
    characterTimeseries: query.data,
  };
}

export function useGetSubmissions(eventId: number) {
  const query = useQuery({
    queryKey: ["submissions", current !== eventId ? eventId : "current"],
    queryFn: () => submissionApi.getSubmissions(eventId),
    enabled: !!eventId,
  });
  return {
    ...query,
    submissions: query.data ?? [],
  };
}

export function useSubmitBounty(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (submission: SubmissionCreate) =>
      submissionApi.submitBounty(eventId, submission),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["submissions", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    submitBounty: m.mutate,
    submitBountyPending: m.isPending,
  };
}

export function useReviewSubmission(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: ({
      submissionId,
      approvalStatus,
    }: {
      submissionId: number;
      approvalStatus: string;
    }) =>
      submissionApi.reviewSubmission(eventId, submissionId, {
        approval_status: approvalStatus,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["submissions", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    ...m,
    reviewSubmission: m.mutate,
    reviewSubmissionPending: m.isPending,
  };
}

export function useChangeUserDisplayName(qc: QueryClient) {
  const m = useMutation({
    mutationFn: (display_name: string) => userApi.updateUser({ display_name }),
    onSuccess: (data) => qc.setQueryData(["user"], data),
  });
  return {
    changeUserDisplayName: m.mutate,
    changeUserDisplayNamePending: m.isPending,
  };
}

export function useRemoveOauthProvider(qc: QueryClient) {
  const m = useMutation({
    mutationFn: (provider: string) => userApi.removeAuth(provider),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
  });
  return {
    removeOauthProvider: m.mutate,
    removeOauthProviderPending: m.isPending,
  };
}

export function useGetGuildStash(eventId: number) {
  const query = useQuery({
    queryKey: ["guildStashes", current !== eventId ? eventId : "current"],
    queryFn: async () =>
      guildStashApi
        .getGuildStashForUser(eventId)
        .then((data) => data.sort((a, b) => (a.index || 0) - (b.index || 0))),
    enabled: () => isLoggedIn(),
    retry: false,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
  return {
    ...query,
    guildStashes: query.data,
  };
}
export function useGetGuildStashTab(eventId: number, tabId: string) {
  const query = useQuery({
    queryKey: [
      "guildStashTab",
      tabId,
      current !== eventId ? eventId : "current",
    ],
    queryFn: async ({ client }) =>
      guildStashApi.getGuildStashTab(eventId, tabId),
    enabled: () => isLoggedIn(),
    refetchInterval: 60 * 1000, // Refetch every minute
  });
  return {
    ...query,
    guildStashTab: query.data,
  };
}

export function useUpdateGuildStashTab(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (tabId: string) => guildStashApi.updateStashTab(eventId, tabId),
    onSuccess: (data, tabId) => {
      qc.invalidateQueries({
        queryKey: [
          "guildStashItems",
          tabId,
          current !== eventId ? eventId : "current",
        ],
      });
      qc.setQueryData(
        ["guildStashes", current !== eventId ? eventId : "current"],
        (old: GuildStashTab[] | undefined) => {
          if (!old) return [];
          return old.map((tab) => {
            if (tab.id === tabId) {
              tab.last_fetch = new Date().toISOString();
            }
            return tab;
          });
        },
      );
    },
  });
  return {
    updateGuildStashTab: m.mutate,
    updateGuildStashTabPending: m.isPending,
  };
}

export function useSwitchStashFetching(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (tabId: string) =>
      guildStashApi.switchStashFetching(eventId, tabId),
    onSuccess: (data) => {
      qc.setQueryData(
        ["guildStashes", current !== eventId ? eventId : "current"],
        (old: GuildStashTab[] | undefined) => {
          if (!old) return [];
          return old.map((tab) => {
            if (tab.id === data.id) {
              return data;
            }
            return tab;
          });
        },
      );
    },
  });
  return {
    switchStashFetching: m.mutate,
    switchStashFetchingPending: m.isPending,
  };
}

export function useFile<T>(filePath: string, format: "text" | "json" = "json") {
  return useQuery({
    queryKey: [filePath],
    queryFn: async () =>
      fetch(filePath).then((res) => {
        if (format === "json") {
          return res.json() as Promise<T>;
        }
        return res.text() as Promise<T>;
      }),
    refetchOnMount: false,
  });
}

export function useGetJobs() {
  const query = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobApi.getJobs(),
  });
  return {
    ...query,
    jobs: query.data ?? [],
  };
}

export function useStartJob(qc: QueryClient) {
  const m = useMutation({
    mutationFn: ({
      eventId,
      jobType,
      endDate,
    }: {
      eventId: number;
      jobType: JobType;
      endDate: Date;
    }) =>
      jobApi.startJob({
        event_id: eventId,
        job_type: jobType,
        end_date: endDate.toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
  return {
    ...m,
    startJob: m.mutate,
    startJobPending: m.isPending,
  };
}

export function useGetScoringPresetsForEvent(eventId: number) {
  const query = useQuery({
    queryKey: [
      "scoringPresetsForEvent",
      current !== eventId ? eventId : "current",
    ],
    queryFn: () => scoringApi.getScoringPresetsForEvent(eventId),
    enabled: !!eventId,
  });
  return {
    ...query,
    scoringPresets: query.data?.sort((a, b) => a.id - b.id) ?? [],
  };
}

export function useAddScoringPreset(
  qc: QueryClient,
  eventId: number,
  callback?: () => void,
) {
  const m = useMutation({
    mutationFn: (scoringPreset: ScoringPresetCreate) =>
      scoringApi.createScoringPreset(eventId, scoringPreset),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [
          "scoringPresetsForEvent",
          current !== eventId ? eventId : "current",
        ],
      });
      if (callback) {
        callback();
      }
    },
  });
  return {
    addScoringPreset: m.mutate,
    addScoringPresetPending: m.isPending,
  };
}

export function useDeleteScoringPreset(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (scoringPresetId: number) =>
      scoringApi.deleteScoringPreset(eventId, scoringPresetId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [
          "scoringPresetsForEvent",
          current !== eventId ? eventId : "current",
        ],
      });
    },
  });
  return {
    deleteScoringPreset: m.mutate,
    deleteScoringPresetPending: m.isPending,
  };
}

export function useCreateEvent(qc: QueryClient, callback?: () => void) {
  const m = useMutation({
    mutationFn: (event: EventCreate) => eventApi.createEvent(event),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      if (callback) {
        callback();
      }
    },
  });
  return {
    createEvent: m.mutate,
    createEventPending: m.isPending,
  };
}

export function useDeleteEvent(qc: QueryClient, callback?: () => void) {
  const m = useMutation({
    mutationFn: (eventId: number) => eventApi.deleteEvent(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      if (callback) {
        callback();
      }
    },
  });
  return {
    deleteEvent: m.mutate,
    deleteEventPending: m.isPending,
  };
}

export function useDuplicateEvent(qc: QueryClient) {
  const m = useMutation({
    mutationFn: ({
      eventId,
      eventCreate,
    }: {
      eventId: number;
      eventCreate: EventCreate;
    }) => eventApi.duplicateEvent(eventId, eventCreate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
  return {
    duplicateEvent: m.mutate,
    duplicateEventPending: m.isPending,
  };
}

export function useGetValidConditionMappings(eventId: number) {
  const query = useQuery({
    queryKey: [
      "validConditionMappings",
      current !== eventId ? eventId : "current",
    ],
    queryFn: () => objectiveApi.getValidMappings(eventId),
    enabled: !!eventId,
  });
  return {
    ...query,
    operatorForField: Object.entries(query.data?.field_to_type ?? {}).reduce(
      (acc, [key, value]) => {
        acc[key as ItemField] = query.data?.valid_operators[value] ?? [];
        return acc;
      },
      {} as { [key in ItemField]: Operator[] },
    ),
    numberFieldsForObjectiveType: query.data
      ?.objective_type_to_number_fields as {
      [key in ObjectiveType]: NumberField[];
    },
  };
}

export function useCreateObjective(
  qc: QueryClient,
  eventId: number,
  callback?: () => void,
) {
  const m = useMutation({
    mutationFn: (objective: ObjectiveCreate) =>
      objectiveApi.createObjective(eventId, objective),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["rules", current !== eventId ? eventId : "current"],
      });
      if (callback) {
        callback();
      }
    },
  });
  return {
    createObjective: m.mutate,
    createObjectivePending: m.isPending,
  };
}

export function useDeleteObjective(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (objectiveId: number) =>
      objectiveApi.deleteObjective(eventId, objectiveId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["rules", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    deleteObjective: m.mutate,
    deleteObjectivePending: m.isPending,
  };
}
export function useCreateBulkObjectives(
  qc: QueryClient,
  eventId: number,
  categoryId: number,
  callback?: () => void,
) {
  const m = useMutation({
    mutationFn: (bulkObjective: BulkObjectiveCreate) => {
      const objectives: ObjectiveCreate[] = bulkObjective.nameList
        .split(",")
        .map((name) => {
          return {
            name: name.trim(),
            required_number: 1,
            objective_type: ObjectiveType.ITEM,
            aggregation: bulkObjective.aggregation_method,
            number_field: NumberField.STACK_SIZE,
            scoring_preset_id: bulkObjective.scoring_preset_id,
            parent_id: categoryId,
            conditions: [
              {
                field: bulkObjective.item_field,
                operator: Operator.EQ,
                value: name,
              },
            ],
          };
        });

      return Promise.all(
        objectives.map((obj) => objectiveApi.createObjective(eventId, obj)),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["rules", current !== eventId ? eventId : "current"],
      });
      if (callback) {
        callback();
      }
    },
  });
  return {
    createBulkObjectives: m.mutate,
    createBulkObjectivesPending: m.isPending,
  };
}

export function useCreateTeam(
  qc: QueryClient,
  eventId: number,
  callback?: () => void,
) {
  const m = useMutation({
    mutationFn: (team: TeamCreate) => teamApi.createTeam(eventId, team),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["events"],
      });
      if (callback) {
        callback();
      }
    },
  });
  return {
    createTeam: m.mutate,
    createTeamPending: m.isPending,
  };
}

export function useDeleteTeam(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (teamId: number) => teamApi.deleteTeam(eventId, teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
  return {
    deleteTeam: m.mutate,
    deleteTeamPending: m.isPending,
  };
}

export function useGetPoBs(userId: number, characterId: string) {
  const query = useQuery({
    queryKey: ["pobExport", userId, characterId],
    queryFn: () => characterApi.getPoBs(userId, characterId),
    enabled: !!userId && !!characterId,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });
  return {
    ...query,
    pobs: query.data,
  };
}

export function useGetGuildLogs(eventId: number, guildId: number) {
  const query = useQuery({
    queryKey: ["guildLogs", current !== eventId ? eventId : "current", guildId],
    queryFn: () => {
      return guildStashApi.getLogEntriesForGuild(eventId, guildId);
    },
  });
  return {
    ...query,
    logs: query.data,
  };
}

export function preloadGuildLogs(
  eventId: number,
  guildId: number,
  limit: number,
  qc: QueryClient,
) {
  return useMutation({
    mutationFn: () =>
      guildStashApi.getLogEntriesForGuild(eventId, guildId, limit),
    onSuccess: (data) => {
      const existing = qc.getQueryData([
        "guildLogs",
        current !== eventId ? eventId : "current",
        guildId,
      ]);
      if (!existing) {
        qc.setQueryData(
          ["guildLogs", current !== eventId ? eventId : "current", guildId],
          data,
        );
      }
    },
  });
}

export function useGetGuilds(eventId: number) {
  const query = useQuery({
    queryKey: ["guilds", current !== eventId ? eventId : "current"],
    queryFn: () => guildStashApi.getGuilds(eventId),
  });
  return {
    ...query,
    guilds: query.data,
  };
}

export function useGetScore(eventId: number) {
  const query = useQuery({
    queryKey: ["score", current !== eventId ? eventId : "current"],
    queryFn: async () => {
      const scoreDiffs = await scoresApi.getLatestScoresForEvent(eventId);
      return scoreDiffs.reduce((acc, diff) => {
        if (!acc[diff.team_id]) {
          acc[diff.team_id] = {};
        }
        acc[diff.team_id][diff.objective_id] = diff.score;
        return acc;
      }, {} as ScoreMap);
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });
  return {
    ...query,
    score: query.data,
  };
}

export function preload(
  qc: QueryClient,
  key: any[],
  queryFn: () => Promise<any>,
) {
  if (!qc.getQueryData(key)) {
    qc.prefetchQuery({
      queryKey: key,
      queryFn: queryFn,
    });
  }
}

export function preloadLadderData(qc: QueryClient) {
  preload(
    qc,
    ["ladder", "current"], //@ts-ignore
    () => ladderApi.getLadder("current"),
  );
}

export function preloadCharacterData(
  userId: number,
  characterId: string,
  eventId: number,
  qc: QueryClient,
) {
  preload(qc, ["pobExport", userId, characterId], () =>
    characterApi.getPoBs(userId, characterId),
  );
  preload(qc, ["activity", eventId, userId], () =>
    activityApi.getEventActivitiesForUser(eventId, userId),
  );
  preload(
    qc,
    ["atlasProgress", current !== eventId ? eventId : "current", userId],
    () => userApi.getAtlasProgression(eventId, userId),
  );
  preload(qc, ["characterTimeseries", characterId, userId], () =>
    characterApi
      .getCharacterHistory(userId, characterId)
      .then((data) => data.sort((a, b) => a.timestamp - b.timestamp)),
  );
}

export function useGetTeamGoals(eventId: number) {
  const query = useQuery({
    queryKey: ["teamGoals", current !== eventId ? eventId : "current"],
    queryFn: async () => teamApi.getTeamSuggestions(eventId),
    enabled: () => isLoggedIn(),
  });
  return {
    ...query,
    teamGoals: query.data,
  };
}

export function useAddTeamSuggestion(
  eventId: number,
  queryClient: QueryClient,
) {
  const mutation = useMutation({
    mutationFn: (suggestion: TeamSuggestion) =>
      teamApi.createObjectiveTeamSuggestion(
        eventId,
        suggestion.objective_id!,
        suggestion,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teamGoals", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    addTeamSuggestion: mutation.mutate,
    ...mutation,
  };
}
export function useDeleteTeamSuggestion(
  eventId: number,
  queryClient: QueryClient,
) {
  const mutation = useMutation({
    mutationFn: (objectiveId: number) =>
      teamApi.deleteObjectiveTeamSuggestion(eventId, objectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teamGoals", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    deleteTeamSuggestion: mutation.mutate,
    ...mutation,
  };
}

export function useGetActivitiesForEvent(eventId: number) {
  const query = useQuery({
    queryKey: ["activity", current !== eventId ? eventId : "current"],
    queryFn: () => activityApi.getEventActivities(eventId),
  });
  return {
    ...query,
    activities: query.data ?? [],
  };
}
export function useGetUserActivity(eventId: number, userId: number) {
  const query = useQuery({
    queryKey: ["activity", eventId, userId],
    queryFn: () => activityApi.getEventActivitiesForUser(eventId, userId),
    enabled: !!userId,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });
  return {
    ...query,
    activity: query.data,
  };
}

export function useGetUserAtlasProgress(eventId: number, userId: number) {
  const query = useQuery({
    queryKey: [
      "atlasProgress",
      current !== eventId ? eventId : "current",
      userId,
    ],
    queryFn: () => userApi.getAtlasProgression(eventId, userId),
    enabled: !!userId,
    refetchOnMount: false,
  });
  return {
    ...query,
    atlasProgress: query.data,
  };
}

export function useGetObjectiveValidations(eventId: number) {
  const query = useQuery({
    queryKey: [
      "objectiveValidations",
      current !== eventId ? eventId : "current",
    ],
    queryFn: () => objectiveApi.getObjectiveValidations(eventId),
    enabled: !!eventId,
  });
  return {
    ...query,
    objectiveValidations: query.data ?? [],
  };
}
