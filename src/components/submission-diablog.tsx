import { ScoreObjective } from "@mytypes/score";
import { Dialog } from "./dialog";
import { useSubmitBounty } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import { useContext, useRef } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { AggregationType, SubmissionCreate } from "@client/api";
import { DateTimePicker } from "./datetime-picker";

type SubmissionDialogProps = {
  objective?: ScoreObjective;
  showModal: boolean;
  setShowModal: (open: boolean) => void;
};

export function SubmissionDialog({
  objective,
  showModal,
  setShowModal,
}: SubmissionDialogProps) {
  const { currentEvent } = useContext(GlobalStateContext);
  const qc = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const { submitBounty } = useSubmitBounty(qc, currentEvent.id);

  if (!currentEvent || !objective) {
    return <></>;
  }

  return (
    <Dialog
      title={`Submission for "${objective?.name}"`}
      open={showModal}
      setOpen={setShowModal}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const values = Object.fromEntries(
            new FormData(e.target as HTMLFormElement)
          );

          if (!objective) {
            return;
          }
          const submissionCreate: SubmissionCreate = {
            ...values,
            timestamp: values.timestamp as string,
            number: parseInt(values.number as string) || 1,
            objective_id: objective.id,
          };
          submitBounty(submissionCreate);
          setShowModal(false);
        }}
        className="form w-full"
      >
        <fieldset className="fieldset bg-base-300 p-6 rounded-box">
          <DateTimePicker
            label="Time (in your timezone)"
            name="timestamp"
          ></DateTimePicker>
          {/* TODO: generalize this  */}
          {objective?.aggregation == AggregationType.MAXIMUM && (
            <>
              <label className="label">Area Level</label>
              <input
                type="number"
                className="input w-full"
                required
                name="number"
              />
            </>
          )}
          {objective?.aggregation == AggregationType.MINIMUM && (
            <>
              <label className="label">
                Time taken for completion in seconds
              </label>
              <input
                type="number"
                className="input w-full"
                required
                name="number"
              />
            </>
          )}
          <label className="label">Link to proof</label>
          <input type="text" className="input w-full" required name="proof" />
          <label className="label">Comment</label>
          <input type="text" className="input w-full" name="comment" />
        </fieldset>
      </form>
      <div className="modal-action w-full">
        <button
          className="btn btn-soft"
          onClick={() => {
            setShowModal(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => formRef.current?.requestSubmit()}
        >
          Submit
        </button>
      </div>
    </Dialog>
  );
}
