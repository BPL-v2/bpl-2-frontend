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
} from "./client";
import {
  ApplicationStatus,
  EventStatus,
  GuildStashTab,
  SignupCreate,
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
export function useGetGuildStashItems(event_id: number, tabId: string) {
  return useQuery({
    queryKey: [
      "guildStashes",
      tabId,
      current !== event_id ? event_id : "current",
    ],
    queryFn: async () => guildStashApi.getGuildStashTabItems(event_id, tabId),
    enabled: () => isLoggedIn(),
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
