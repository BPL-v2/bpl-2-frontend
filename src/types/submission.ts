import { ScoringObjective } from "./scoring-objective";
import { User } from "./user";

export type Submission = {
  id: number;
  objective: ScoringObjective;
  number: number;
  proof: string;
  timestamp: Date;
  approval_status: ApprovalStatus;
  comment: string;
  user_id: number;
  user: User;
  review_comment: string;
  reviewerId: number;
};

export type SubmissionCreate = {
  objective_id: number;
  number: number;
  timestamp: Date;

  id?: number;
  proof?: string;
  comment?: string;
};

export type SubmissionReview = {
  approvalStatus?: ApprovalStatus;
  comment?: string;
};

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
