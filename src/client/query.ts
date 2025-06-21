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
} from "./api";
import { isLoggedIn } from "@utils/token";

let current = 0;

export function useGetEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () =>
      eventApi.getEvents().then((events) => {
        events.forEach((event) => {
          if (event.is_current) {
            current = event.id;
          }
        });
        return events;
      }),
  });
}

export function useGetLadder(event_id: number) {
  return useQuery({
    queryKey: ["ladder", current !== event_id ? event_id : "current"],
    queryFn: async () => ladderApi.getLadder(event_id),
    refetchInterval: 60 * 1000,
  });
}

export function useGetUsers(event_id: number) {
  return useQuery({
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
}

export function useGetStreams(event_id: number) {
  return useQuery({
    queryKey: ["streams", current !== event_id ? event_id : "current"],
    queryFn: async () => streamApi.getStreams(event_id),
  });
}

export function useGetEventStatus(event_id: number) {
  return useQuery({
    queryKey: ["eventStatus", current !== event_id ? event_id : "current"],
    queryFn: async () => eventApi.getEventStatus(event_id),
    refetchOnMount: false,
  });
}

export function useGetSignups(event_id: number)  {
  return useQuery({
    queryKey: ["signups", current !== event_id ? event_id : "current"],
    queryFn: async () => signupApi.getEventSignups(event_id),
  });
}

export function useCreateSignup(queryClient: QueryClient) {
  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: number; body: SignupCreate }) =>
      signupApi.createSignup(eventId, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        [
          "eventStatus",
          current !== variables.eventId ? variables.eventId : "current",
        ],
        data
      );
    },
  });
}

export function useDeleteSignup(queryClient: QueryClient) {
  return useMutation({
    mutationFn: signupApi.deleteSignup,
    onSuccess: (_, eventId) => {
      queryClient.setQueryData(
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
    },
  });
}

export function useAddUsersToTeams(queryClient: QueryClient) {
  return useMutation({
    mutationFn: ({event_id, users}: {event_id: number, users: TeamUserCreate[]}) => teamApi.addUsersToTeams(event_id, users),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["signups", current !== variables.event_id ? variables.event_id : "current"] });
    },
  });
}

export function useGetRules(event_id: number) {
  return useQuery({
    queryKey: ["rules", current !== event_id ? event_id : "current"],
    queryFn: async () => objectiveApi.getObjectiveTreeForEvent(event_id),
  });
}

export function useGetScoringPresets(event_id: number) {
  return useQuery({
    queryKey: ["scoringPresets", current !== event_id ? event_id : "current"],
    queryFn: async () => scoringApi.getScoringPresetsForEvent(event_id),
  });
}

export function useGetUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => userApi.getUser(),
    enabled: () => isLoggedIn(),
    refetchOnMount: false,
  });
}

export function useGetUserById(userId: number) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
  });
}

export function useGetUserCharacters(userId: number) {
  return useQuery({
    queryKey: ["userCharacters", userId],
    queryFn: () => characterApi.getUserCharacters(userId),
    enabled: !!userId,
  });
}

export function useGetCharacterTimeseries(eventId: number, userId: number) {
  return useQuery({
    queryKey: ["characterTimeseries", eventId, userId],
    queryFn: () => characterApi.getCharacterEventHistoryForUser(eventId, userId),
    enabled: !!userId && !!eventId,
    select: (data) => data.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
  });
}

export function useGetSubmissions(eventId: number) {
  return useQuery({
    queryKey: ["submissions", eventId],
    queryFn: () => submissionApi.getSubmissions(eventId),
    enabled: !!eventId,
  });
}

export function useSubmitBounty(queryClient: QueryClient, eventId: number) {
  return useMutation({
    mutationFn: (submission: SubmissionCreate) => submissionApi.submitBounty(eventId, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", eventId] });
    },
  });
}

export function useReviewSubmission(queryClient: QueryClient, eventId: number) {
  return useMutation({
    mutationFn: ({ submissionId, approvalStatus }: { submissionId: number; approvalStatus: string }) =>
      submissionApi.reviewSubmission(eventId, submissionId, { approval_status: approvalStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", eventId] });
    },
  });
}

export function useChangeUserDisplayName(queryClient: QueryClient) {
  return useMutation({
    mutationFn: (display_name: string) => userApi.updateUser({ display_name }),
    onSuccess: (data) => queryClient.setQueryData(["user"], data),
  });
}

export function useRemoveOauthProvider(queryClient: QueryClient) {
  return useMutation({
    mutationFn: (provider: string) => userApi.removeAuth(provider),
    onSuccess: () => queryClient.setQueryData(["user"], undefined),
  });
}

export function useGetCharacterEventHistory(
  event_id: number,
  user_id?: number
) {
  return useQuery({
    queryKey: ["characterHistory", event_id, user_id],
    queryFn: async () => {
      if (user_id !== undefined) {
        return characterApi.getCharacterEventHistoryForUser(event_id, user_id);
      }
      return [];
    },
  });
}

export function useGetTeamGoals(event_id: number) {
  return useQuery({
    queryKey: ["teamGoals", current !== event_id ? event_id : "current"],
    queryFn: async () => teamApi.getTeamSuggestions(event_id),
    enabled: () => isLoggedIn(),
  });
}

export function useGetGuildStash(event_id: number) {
  return useQuery({
    queryKey: ["guildStashes", current !== event_id ? event_id : "current"],
    queryFn: async () =>
      guildStashApi
        .getGuildStashForUser(event_id)
        .then((data) => data.sort((a, b) => (a.index || 0) - (b.index || 0))),
    enabled: () => isLoggedIn(),
    refetchOnMount: false,
  });
}
export function useGetGuildStashTab(event_id: number, tabId: string) {
  return useQuery({
    queryKey: [
      "guildStashTab",
      tabId,
      current !== event_id ? event_id : "current",
    ],
    queryFn: async ({ client }) =>
      guildStashApi.getGuildStashTab(event_id, tabId),
    enabled: () => isLoggedIn(),
  });
}

export function useUpdateGuildStashTab(
  queryClient: QueryClient,
  event_id: number
) {
  return useMutation({
    mutationFn: (tabId: string) =>
      guildStashApi.updateStashTab(event_id, tabId),
    onSuccess: (data, tabId) => {
      queryClient.invalidateQueries({
        queryKey: [
          "guildStashItems",
          tabId,
          current !== event_id ? event_id : "current",
        ],
      });
      queryClient.setQueryData(
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
}

export function useUpdateGuildStash(
  queryClient: QueryClient,
  event_id: number
) {
  return useMutation({
    mutationFn: () => guildStashApi.updateGuildStash(event_id),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["guildStashes", current !== event_id ? event_id : "current"],
        data
      );
    },
  });
}

export function useSwitchStashFetching(
  queryClient: QueryClient,
  event_id: number
) {
  return useMutation({
    mutationFn: (tabId: string) =>
      guildStashApi.switchStashFetching(event_id, tabId),
    onSuccess: (data) => {
      queryClient.setQueryData(
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
  return useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobApi.getJobs(),
  });
}

export function useStartJob(queryClient: QueryClient) {
  return useMutation({
    mutationFn: ({ eventId, jobType, durationInSeconds }: { eventId: number; jobType: JobType; durationInSeconds: number }) =>
      jobApi.startJob({ event_id: eventId, job_type: jobType, duration_in_seconds: durationInSeconds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useGetValidMappings(eventId: number) {
  return useQuery({
    queryKey: ["validMappings", eventId],
    queryFn: () => conditionApi.getValidMappings(eventId),
    enabled: !!eventId,
  });
}

export function useGetScoringPresetsForEvent(eventId: number) {
  return useQuery({
    queryKey: ["scoringPresetsForEvent", eventId],
    queryFn: () => scoringApi.getScoringPresetsForEvent(eventId),
    enabled: !!eventId,
  });
}


export function useCreateEvent(queryClient: QueryClient) {
  return useMutation({
    mutationFn: (event: EventCreate) => eventApi.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent(queryClient: QueryClient) {
  return useMutation({
    mutationFn: (eventId: number) => eventApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}