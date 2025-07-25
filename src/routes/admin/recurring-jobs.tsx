import { createFileRoute } from "@tanstack/react-router";
import { Event, JobType, Permission, RecurringJob } from "@client/api";
import React from "react";
import { useGetEvents, useGetJobs, useStartJob } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Dialog } from "@components/dialog";
import { renderConditionally } from "@utils/token";
import Select from "@components/select";

dayjs.extend(customParseFormat);

export const Route = createFileRoute("/admin/recurring-jobs")({
  component: renderConditionally(RecurringJobsPage, [Permission.admin]),
});

const formatDateForInput = (date: Date | null) => {
  if (!date) return "";
  const tzOffset = 2 * date.getTimezoneOffset() * 60000;
  const localISO = new Date(date.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);
  return localISO;
};

function RecurringJobsPage() {
  const queryClient = useQueryClient();
  const { events, isLoading: eventsLoading } = useGetEvents();
  const { jobs = [], isLoading: jobsLoading } = useGetJobs();
  const { startJob, isPending: startJobPending } = useStartJob(queryClient);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | null>(
    null
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  const stopJob = (job: RecurringJob) => {
    startJob({
      eventId: job.event_id,
      jobType: job.job_type,
      endDate: new Date(),
    });
  };

  React.useEffect(() => {
    if (selectedEvent) {
      setSelectedEndDate(
        dayjs(selectedEvent.event_end_time, "YYYY-MM-DDTHH:mm:ss").toDate()
      );
    }
  }, [selectedEvent]);

  // Show loading state while any data is loading
  if (eventsLoading || jobsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (!events) {
    return <div>Loading events...</div>;
  }
  return (
    <>
      <Dialog
        title="Create recurring job"
        open={showModal}
        setOpen={setShowModal}
      >
        <form
          className="space-y-4 text-left w-full"
          onSubmit={(e) => {
            const values = new FormData(formRef.current!);
            e.preventDefault();
            startJob({
              eventId: Number(values.get("event")),
              jobType: values.get("jobType") as JobType,
              endDate: new Date(values.get("endDate") as string),
            });
            setShowModal(false);
            formRef.current?.reset();
          }}
          ref={formRef}
        >
          <fieldset className="fieldset bg-base-300 rounded-box p-4">
            <label className="label">Event</label>
            <Select
              name="event"
              required
              onChange={(value) => {
                setSelectedEvent(
                  // @ts-ignore
                  events.find((event) => event.id === value) || null
                );
              }}
              className="w-full"
              placeholder="Pick an event"
              options={events.map((event) => ({
                label: event.name,
                value: event.id,
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
            disabled={startJobPending}
          >
            {startJobPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : null}
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
                    disabled={startJobPending}
                  >
                    {startJobPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : null}
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
