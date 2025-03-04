import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Event, JobType, Permission, RecurringJob } from "../client";
import { jobApi } from "../client/client";
import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const RecurringJobsPage = () => {
  const { events, user } = useContext(GlobalStateContext);
  const [jobs, setJobs] = React.useState<RecurringJob[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
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

  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }
  return (
    <>
      <dialog
        className="modal "
        open={showModal}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <div className="modal-box bg-base-200 border-2 border-base-100 max-w-2xl">
          <h3 className="font-bold text-lg mb-8">Create recurring job</h3>
          <form
            className="space-y-4 text-left w-full"
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
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Event</legend>
              <select
                id="event"
                name="event"
                defaultValue=""
                className="select w-full"
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
                className="select w-full"
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
              <div className="flex gap-4">
                <DatePicker
                  id="endDate"
                  name="endDate"
                  required
                  showTime={{ format: "YYYY-MM-DD" }}
                  value={
                    selectedEvent
                      ? dayjs(
                          selectedEvent.event_end_time,
                          "YYYY-MM-DDTHH:mm:ssZ"
                        )
                      : undefined
                  }
                />
                <input
                  type="number"
                  className="input input-bordered "
                  placeholder="Duration in seconds"
                />
              </div>
            </fieldset>
          </form>
          <div className="modal-action">
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
        </div>
      </dialog>

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
};
export default RecurringJobsPage;
