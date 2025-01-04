import { Submission, SubmissionCreate } from "../types/submission";
import { fetchWrapper } from "./base";

export async function fetchSubmissionsForEvent(
  eventId: number
): Promise<Submission[]> {
  return await fetchWrapper<Submission[]>(
    "/events/" + eventId + "/submissions",
    "GET"
  );
}

export async function submitBounty(
  eventId: number,
  data: SubmissionCreate
): Promise<Submission> {
  data.number = data.number || 1;
  return fetchWrapper<Submission>(
    "/events/" + eventId + "/submissions",
    "PUT",
    data
  );
}

export async function reviewBounty(
  eventId: number,
  submissionId: number,
  data: Partial<Submission>
): Promise<Submission> {
  return fetchWrapper<Submission>(
    "/events/" + eventId + "/submissions/" + submissionId + "/review",
    "PUT",
    data
  );
}
