import { createFileRoute } from "@tanstack/react-router";

import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Event, JobType, Permission, RecurringJob } from "@client/api";
import { jobApi } from "@client/client";
import React from "react";
import dayjs from "dayjs";
import { Dialog } from "@components/dialog";
import { renderConditionally } from "@utils/token";
import Select from "@components/select";

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
  const { events } = useContext(GlobalStateContext);
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
          <fieldset className="fieldset bg-base-300 rounded-box p-4">
            <label className="label">Event</label>
            <Select
              name="event"
              required
              onChange={(value) =>
                setSelectedEvent(
                  events.find((event) => event.id === parseInt(value)) || null
                )
              }
              className="w-full"
              placeholder="Pick an event"
              options={events.map((event) => ({
                label: event.name,
                value: String(event.id),
              }))}
            ></Select>
            <label className="label">Job Type</label>
            <Select
              name="jobType"
              placeholder="Pick a job type"
              className="w-full"
              required
              options={Object.values(JobType)}
            ></Select>
            <label className="label">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              className="input w-full"
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
