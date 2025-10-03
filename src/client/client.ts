import { Configuration } from ".";
import {
  ActivityApiFactory,
  CharactersApiFactory,
  ConditionApiFactory,
  EventApiFactory,
  GuildStashApiFactory,
  JobsApiFactory,
  LadderApiFactory,
  OauthApiFactory,
  ObjectiveApiFactory,
  ScoresApiFactory,
  ScoringApiFactory,
  SignupApiFactory,
  StreamsApiFactory,
  SubmissionApiFactory,
  TeamApiFactory,
  UserApiFactory,
} from "./api";

import "isomorphic-fetch";

// Custom fetch wrapper to add Authorization header to all requests
const authenticatedFetch: typeof fetch = async (input, init = {}) => {
  const authToken = localStorage.getItem("auth");
  const headers = new Headers(init.headers || {});
  if (authToken) {
    try {
      headers.set("Authorization", `Bearer ${authToken}`);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }
  return fetch(input, { ...init, headers });
};

const baseUrl = process.env.VITE_PUBLIC_BPL_BACKEND_URL;
const config: Configuration = { basePath: baseUrl };

export const eventApi = EventApiFactory(config, authenticatedFetch, baseUrl);
export const teamApi = TeamApiFactory(config, authenticatedFetch, baseUrl);
export const userApi = UserApiFactory(config, authenticatedFetch, baseUrl);
export const objectiveApi = ObjectiveApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const scoringApi = ScoringApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const scoresApi = ScoresApiFactory(config, authenticatedFetch, baseUrl);
export const conditionApi = ConditionApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const submissionApi = SubmissionApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const signupApi = SignupApiFactory(config, authenticatedFetch, baseUrl);
export const oauthApi = OauthApiFactory(config, authenticatedFetch, baseUrl);
export const streamApi = StreamsApiFactory(config, authenticatedFetch, baseUrl);
export const jobApi = JobsApiFactory(config, authenticatedFetch, baseUrl);
export const ladderApi = LadderApiFactory(config, authenticatedFetch, baseUrl);
export const activityApi = ActivityApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const characterApi = CharactersApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
export const guildStashApi = GuildStashApiFactory(
  config,
  authenticatedFetch,
  baseUrl,
);
