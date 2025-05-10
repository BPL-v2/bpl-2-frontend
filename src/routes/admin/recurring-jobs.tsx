import { createFileRoute } from "@tanstack/react-router";

import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Event, JobType, Permission, RecurringJob } from "@client/api";
import { jobApi } from "@client/client";
import React from "react";
import dayjs from "dayjs";
import { Dialog } from "@components/dialog";
import { renderConditionally } from "@utils/token";

export const Route = createFileRoute("/admin/recurring-jobs")({
  component: renderConditionally(RecurringJobsPage, [Permission.admin]),
});

const formatDateForInput = (date: Date | null) => {
  if (!date) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function RecurringJobsPage() {
  const { events, user } = useContext(GlobalStateContext);
  const [jobs, setJobs] = React.useState<RecurringJob[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | null>(
    null
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  const stopJob = (job: RecurringJob) => {
    jobApi
      .startJob({
        event_id: job.event_id,
        job_type: job.job_type,
        duration_in_seconds: 0,
      })
      .then(() => {
        jobApi.getJobs().then(setJobs);
      });
  };

  React.useEffect(() => {
    jobApi.getJobs().then(setJobs);
  }, []);

  React.useEffect(() => {
    if (selectedEvent) {
      setSelectedEndDate(
        dayjs(selectedEvent.event_end_time, "YYYY-MM-DDTHH:mm:ss").toDate()
      );
    }
  }, [selectedEvent]);

  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }
  return (
    <>
      <Dialog
        title="Create recurring job"
        open={showModal}
        setOpen={setShowModal}
      >
        <form
          className="space-y-4 text-left"
          onSubmit={(e) => {
            const values = new FormData(formRef.current!);
            e.preventDefault();
            jobApi
              .startJob({
                event_id: Number(values.get("event")),
                job_type: values.get("jobType") as JobType,
                end_date: new Date(
                  values.get("endDate") as string
                ).toISOString(),
              })
              .then(() => {
                jobApi.getJobs().then(setJobs);
                setShowModal(false);
                formRef.current?.reset();
              });
          }}
          ref={formRef}
        >
          <fieldset className="fieldset rounded-box bg-base-300">
            <legend className="fieldset-legend">Event</legend>
            <select
              id="event"
              name="event"
              defaultValue=""
              className="select"
              required
              onChange={(e) =>
                setSelectedEvent(
                  events.find(
                    (event) => event.id === parseInt(e.target.value)
                  ) || null
                )
              }
            >
              <option disabled value="">
                Pick an event
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>

            <legend className="fieldset-legend">Job Type</legend>
            <select
              id="jobType"
              name="jobType"
              defaultValue=""
              className="select"
              required
            >
              <option disabled value="">
                Pick a job type
              </option>
              {Object.values(JobType).map((jobType) => (
                <option key={jobType} value={jobType}>
                  {jobType}
                </option>
              ))}
            </select>
            <legend className="fieldset-legend">End Date</legend>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              className="input"
              defaultValue={formatDateForInput(selectedEndDate)}
              required
            />
          </fieldset>
        </form>
        <div className="modal-action">
          <button
            className="btn btn-soft"
            type="button"
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

      <table className="table w-full mt-4">
        <thead className="bg-base-200">
          <tr>
            <th>Job Type</th>
            <th>Event</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-base-300">
          {jobs.map((job, id) => (
            <tr key={id}>
              <td>{job.job_type}</td>
              <td>{events.find((event) => event.id === job.event_id)?.name}</td>
              <td>{new Date(job.end_date).toLocaleString()}</td>
              <td>
                {new Date(job.end_date) < new Date() ? "Stopped" : "Running"}
              </td>
              <td className="flex gap-2">
                {new Date(job.end_date) < new Date() ? null : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => stopJob(job)}
                  >
                    Stop
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn btn-primary mt-4"
        onClick={() => setShowModal(true)}
      >
        Add Job
      </button>
    </>
  );
}
export default RecurringJobsPage;
