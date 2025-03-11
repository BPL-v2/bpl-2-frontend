import { Configuration } from ".";
import {
  ConditionApiFactory,
  EventApiFactory,
  JobsApiFactory,
  LadderApiFactory,
  OauthApiFactory,
  ObjectiveApiFactory,
  ScoringApiFactory,
  SignupApiFactory,
  StreamsApiFactory,
  SubmissionApiFactory,
  TeamApiFactory,
  UserApiFactory,
} from "./api";

import "portable-fetch";

const baseUrl = process.env.VITE_BACKEND_URL;
const config: Configuration = {
  basePath: baseUrl,
};

export const eventApi = EventApiFactory(config, fetch, baseUrl);
export const teamApi = TeamApiFactory(config, fetch, baseUrl);
export const userApi = UserApiFactory(config, fetch, baseUrl);
export const objectiveApi = ObjectiveApiFactory(config, fetch, baseUrl);
export const scoringApi = ScoringApiFactory(config, fetch, baseUrl);
export const conditionApi = ConditionApiFactory(config, fetch, baseUrl);
export const submissionApi = SubmissionApiFactory(config, fetch, baseUrl);
export const signupApi = SignupApiFactory(config, fetch, baseUrl);
export const oauthApi = OauthApiFactory(config, fetch, baseUrl);
export const streamApi = StreamsApiFactory(config, fetch, baseUrl);
export const jobApi = JobsApiFactory(config, fetch, baseUrl);
export const ladderApi = LadderApiFactory(config, fetch, baseUrl);
