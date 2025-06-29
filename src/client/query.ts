import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  characterApi,
  eventApi,
  guildStashApi,
  ladderApi,
  objectiveApi,
  scoringApi,
  signupApi,
  streamApi,
  teamApi,
  userApi,
  submissionApi,
  jobApi,
  conditionApi,
} from "./client";
import {
  ApplicationStatus,
  EventStatus,
  GuildStashTab,
  SignupCreate,
  JobType,
  TeamUserCreate,
  SubmissionCreate,
  EventCreate,
  ItemField,
  Operator,
  ObjectiveType,
  NumberField,
  ObjectiveCreate,
  ConditionCreate,
  TeamCreate,
  ScoringPresetCreate,
} from "./api";
import { isLoggedIn } from "@utils/token";
import { BulkObjectiveCreate } from "src/routes/admin/events/$eventId/categories.$categoryId";

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

export function useGetLadder(event_id: number) {
  const query = useQuery({
    queryKey: ["ladder", current !== event_id ? event_id : "current"],
    queryFn: async () => ladderApi.getLadder(event_id),
    refetchInterval: 60 * 1000,
  });
  return {
    ...query,
    ladder: query.data,
  };
}

export function useGetUsers(event_id: number) {
  const query = useQuery({
    queryKey: ["users", current !== event_id ? event_id : "current"],
    queryFn: async () =>
      userApi.getUsersForEvent(event_id).then((users) => {
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

export function useGetStreams(event_id: number) {
  const query = useQuery({
    queryKey: ["streams", current !== event_id ? event_id : "current"],
    queryFn: async () => streamApi.getStreams(event_id),
  });
  return {
    ...query,
    streams: query.data,
  };
}

export function useGetEventStatus(event_id: number) {
  const query = useQuery({
    queryKey: ["eventStatus", current !== event_id ? event_id : "current"],
    queryFn: async () => eventApi.getEventStatus(event_id),
    refetchOnMount: false,
  });
  return {
    ...query,
    eventStatus: query.data,
  };
}

export function useGetSignups(event_id: number) {
  const query = useQuery({
    queryKey: ["signups", current !== event_id ? event_id : "current"],
    queryFn: async () => signupApi.getEventSignups(event_id),
  });
  return {
    ...query,
    signups: query.data,
  };
}

export function useGetOwnSignup(event_id: number) {
  const query = useQuery({
    queryKey: ["ownSignup", current !== event_id ? event_id : "current"],
    queryFn: async () => signupApi.getPersonalSignup(event_id),
  });
  return {
    signup: query.data,
  };
}

export function useCreateSignup(
  qc: QueryClient,
  successCallback?: () => void,
  errorCallback?: (msg: string) => void
) {
  const m = useMutation({
    mutationFn: ({ eventId, body }: { eventId: number; body: SignupCreate }) =>
      signupApi.createSignup(eventId, body),
    onSuccess: (data, variables) => {
      qc.setQueryData(
        [
          "eventStatus",
          current !== variables.eventId ? variables.eventId : "current",
        ],
        (old: EventStatus) => {
          if (!old) return old;
          return {
            ...old,
            application_status: ApplicationStatus.applied,
          };
        }
      );
      qc.setQueryData(
        [
          "ownSignup",
          current !== variables.eventId ? variables.eventId : "current",
        ],
        data
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
    mutationFn: signupApi.deleteSignup,
    onSuccess: (_, eventId) => {
      qc.setQueryData(
        ["eventStatus", current !== eventId ? eventId : "current"],
        (old: EventStatus) => {
          if (!old) return old;
          return {
            ...old,
            application_status: ApplicationStatus.none,
            team_id: null,
            is_team_lead: false,
          };
        }
      );
      qc.setQueryData(
        ["ownSignup", current !== eventId ? eventId : "current"],
        undefined
      );
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
      event_id,
      users,
    }: {
      event_id: number;
      users: TeamUserCreate[];
    }) => teamApi.addUsersToTeams(event_id, users),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: [
          "signups",
          current !== variables.event_id ? variables.event_id : "current",
        ],
      });
    },
  });
  return {
    addUsersToTeams: m.mutate,
    addUsersToTeamsPending: m.isPending,
  };
}

export function useGetRules(event_id: number) {
  const query = useQuery({
    queryKey: ["rules", current !== event_id ? event_id : "current"],
    queryFn: async () => objectiveApi.getObjectiveTreeForEvent(event_id),
  });
  return {
    ...query,
    rules: query.data,
  };
}

export function useGetScoringPresets(event_id: number) {
  const query = useQuery({
    queryKey: ["scoringPresets", current !== event_id ? event_id : "current"],
    queryFn: async () => scoringApi.getScoringPresetsForEvent(event_id),
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
    queryFn: () => characterApi.getUserCharacters(userId),
    enabled: !!userId,
  });
  return {
    ...query,
    userCharacters: query.data,
  };
}

export function useGetCharacterTimeseries(eventId: number, userId: number) {
  const query = useQuery({
    queryKey: ["characterTimeseries", eventId, userId],
    queryFn: () =>
      characterApi.getCharacterEventHistoryForUser(eventId, userId),
    enabled: !!userId && !!eventId,
    select: (data) =>
      data.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
  });
  return {
    ...query,
    characterTimeseries: query.data,
  };
}

export function useGetSubmissions(eventId: number) {
  const query = useQuery({
    queryKey: ["submissions", eventId],
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
      qc.invalidateQueries({ queryKey: ["submissions", eventId] });
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
      qc.invalidateQueries({ queryKey: ["submissions", eventId] });
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
    onSuccess: () => qc.setQueryData(["user"], undefined),
  });
  return {
    removeOauthProvider: m.mutate,
    removeOauthProviderPending: m.isPending,
  };
}

export function useGetCharacterEventHistory(
  event_id: number,
  user_id?: number
) {
  const query = useQuery({
    queryKey: ["characterHistory", event_id, user_id],
    queryFn: async () => {
      if (user_id !== undefined) {
        return characterApi.getCharacterEventHistoryForUser(event_id, user_id);
      }
      return [];
    },
  });
  return {
    ...query,
    characterHistory: query.data,
  };
}

export function useGetTeamGoals(event_id: number) {
  const query = useQuery({
    queryKey: ["teamGoals", current !== event_id ? event_id : "current"],
    queryFn: async () => teamApi.getTeamSuggestions(event_id),
    enabled: () => isLoggedIn(),
  });
  return {
    ...query,
    teamGoals: query.data,
  };
}

export function useGetGuildStash(event_id: number) {
  const query = useQuery({
    queryKey: ["guildStashes", current !== event_id ? event_id : "current"],
    queryFn: async () =>
      guildStashApi
        .getGuildStashForUser(event_id)
        .then((data) => data.sort((a, b) => (a.index || 0) - (b.index || 0))),
    enabled: () => isLoggedIn(),
    refetchOnMount: false,
  });
  return {
    ...query,
    guildStashes: query.data,
  };
}
export function useGetGuildStashTab(event_id: number, tabId: string) {
  const query = useQuery({
    queryKey: [
      "guildStashTab",
      tabId,
      current !== event_id ? event_id : "current",
    ],
    queryFn: async ({ client }) =>
      guildStashApi.getGuildStashTab(event_id, tabId),
    enabled: () => isLoggedIn(),
  });
  return {
    ...query,
    guildStashTab: query.data,
  };
}

export function useUpdateGuildStashTab(qc: QueryClient, event_id: number) {
  const m = useMutation({
    mutationFn: (tabId: string) =>
      guildStashApi.updateStashTab(event_id, tabId),
    onSuccess: (data, tabId) => {
      qc.invalidateQueries({
        queryKey: [
          "guildStashItems",
          tabId,
          current !== event_id ? event_id : "current",
        ],
      });
      qc.setQueryData(
        ["guildStashes", current !== event_id ? event_id : "current"],
        (old: GuildStashTab[] | undefined) => {
          if (!old) return [];
          return old.map((tab) => {
            if (tab.id === tabId) {
              tab.last_fetch = new Date().toISOString();
            }
            return tab;
          });
        }
      );
    },
  });
  return {
    updateGuildStashTab: m.mutate,
    updateGuildStashTabPending: m.isPending,
  };
}

export function useUpdateGuildStash(qc: QueryClient, event_id: number) {
  const m = useMutation({
    mutationFn: () => guildStashApi.updateGuildStash(event_id),
    onSuccess: (data) => {
      qc.setQueryData(
        ["guildStashes", current !== event_id ? event_id : "current"],
        data
      );
    },
  });
  return {
    updateGuildStash: m.mutate,
    updateGuildStashPending: m.isPending,
  };
}

export function useSwitchStashFetching(qc: QueryClient, event_id: number) {
  const m = useMutation({
    mutationFn: (tabId: string) =>
      guildStashApi.switchStashFetching(event_id, tabId),
    onSuccess: (data) => {
      qc.setQueryData(
        ["guildStashes", current !== event_id ? event_id : "current"],
        (old: GuildStashTab[] | undefined) => {
          if (!old) return [];
          return old.map((tab) => {
            if (tab.id === data.id) {
              return data;
            }
            return tab;
          });
        }
      );
    },
  });
  return {
    switchStashFetching: m.mutate,
    switchStashFetchingPending: m.isPending,
  };
}

export function useFile<T>(filePath: string) {
  return useQuery({
    queryKey: [filePath],
    queryFn: async () =>
      fetch(filePath).then((res) => res.json() as Promise<T>),
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
  callback?: () => void
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
    queryKey: ["validConditionMappings", eventId],
    queryFn: () => conditionApi.getValidMappings(eventId),
    enabled: !!eventId,
  });
  return {
    ...query,
    operatorForField: Object.entries(query.data?.field_to_type ?? {}).reduce(
      (acc, [key, value]) => {
        acc[key as ItemField] = query.data?.valid_operators[value] ?? [];
        return acc;
      },
      {} as { [key in ItemField]: Operator[] }
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
  callback?: () => void
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
  callback?: () => void
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
        objectives.map((obj) => objectiveApi.createObjective(eventId, obj))
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

export function useDeleteObjectiveCondition(qc: QueryClient, eventId: number) {
  const m = useMutation({
    mutationFn: (conditionId: number) =>
      conditionApi.deleteCondition(eventId, conditionId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["rules", current !== eventId ? eventId : "current"],
      });
    },
  });
  return {
    deleteObjectiveCondition: m.mutate,
    deleteObjectiveConditionPending: m.isPending,
  };
}

export function useAddObjectiveCondition(
  qc: QueryClient,
  eventId: number,
  callback?: () => void
) {
  const m = useMutation({
    mutationFn: (condition: ConditionCreate) =>
      conditionApi.createCondition(eventId, condition),
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
    addObjectiveCondition: m.mutate,
    addObjectiveConditionPending: m.isPending,
  };
}

export function useCreateTeam(
  qc: QueryClient,
  eventId: number,
  callback?: () => void
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

// export function useGetCharacterStats(userId: number, eventId: number) {
//   const query = useQuery({
//     queryKey: ["characterStats", userId, eventId],
//     queryFn: ({
//       eventId,
//       characterName,
//       start,
//       end,
//     }: {
//       eventId: number;
//       characterName: string;
//       start: string;
//       end: string;
//     }) =>
//       characterApi.getCharacterTimeSeries(
//         userId,
//         eventId,
//         characterName,
//         start,
//         end
//       ),
//   });
//   return {
//     ...query,
//     characterStats: query.data,
//   };
// }
