import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  Checkbox,
  Dropdown,
  Form,
  FormInstance,
  MenuProps,
  Select,
} from "antd";
import { DiscordFilled } from "@ant-design/icons";
import { ApplicationStatus, ExpectedPlayTime, Team } from "../client";
import { signupApi } from "../client/client";

type ApplicationButtonProps = {};
const ApplicationButton = ({}: ApplicationButtonProps) => {
  let { user, eventStatus, currentEvent, setEventStatus } =
    useContext(GlobalStateContext);
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<FormInstance>(null);
  const [userTeam, setUserTeam] = React.useState<Team | undefined>(undefined);
  const [isServerMember, setIsServerMember] = React.useState(true);
  useEffect(() => {
    setUserTeam(
      user
        ? currentEvent?.teams.find((team) => team.id === eventStatus?.team_id)
        : undefined
    );
  }, [eventStatus, user]);
  if (
    !user ||
    !currentEvent ||
    currentEvent.application_start_time > new Date().toISOString()
  ) {
    return null;
  }
  if (userTeam) {
    return (
      <button
        className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
      >
        {userTeam.name}
      </button>
    );
  }
  if (eventStatus?.application_status === ApplicationStatus.applied) {
    const items = [
      {
        key: "withdraw",
        danger: true,
        label: "Withdraw Application",
        onClick: () => {
          signupApi.deleteSignup(currentEvent.id).then(() => {
            setEventStatus({
              ...eventStatus,
              application_status: ApplicationStatus.none,
            });
          });
        },
      },
    ] as MenuProps["items"];
    return (
      <Dropdown menu={{ items }} trigger={["hover"]}>
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
        >
          Application Pending
        </button>
      </Dropdown>
    );
  }

  if (eventStatus?.application_status === ApplicationStatus.none) {
    return (
      <>
        <dialog
          id="my_modal_1"
          className="modal"
          open={modalOpen}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        >
          <div className="modal-box bg-base-200 border-2 border-base-100">
            <h3 className="font-bold text-lg mb-8">Apply for Event</h3>
            <Form
              layout="vertical"
              ref={formRef}
              onFinish={(values) => {
                signupApi
                  .createSignup(currentEvent.id, values)
                  .then(() => {
                    setEventStatus({
                      ...eventStatus,
                      application_status: ApplicationStatus.applied,
                    });
                    setModalOpen(false);
                    formRef.current?.resetFields();
                  })
                  .catch((error) => {
                    console.error(error);
                    setIsServerMember(false);
                  });
              }}
            >
              <Form.Item
                label="How many hours will you be able to play per day?"
                name="playtime"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select how many hours you can play per day",
                  },
                ]}
              >
                <Select>
                  {Object.entries(ExpectedPlayTime).map((entry) => (
                    <Select.Option key={entry[0]} value={entry[0]}>
                      {entry[1]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                layout="horizontal"
                label={
                  <>
                    {"I've read the "}
                    <a
                      className="underline text-primary ml-1"
                      href="/rules"
                      target="_blank"
                    >
                      rules
                    </a>
                  </>
                }
                name="rulecheck"
                valuePropName={"checked"}
                rules={[
                  {
                    required: true,
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          "Please confirm that you've read the rules"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Checkbox />
              </Form.Item>
            </Form>
            {user.discord_id ? null : (
              <div className="mt-4">
                <p>
                  You need a linked discord account and join our server to
                  apply.
                </p>
                <button className="btn btn-lg bg-discord text-white text-xl mt-4">
                  <DiscordFilled></DiscordFilled> Link Discord Account
                </button>
              </div>
            )}
            {isServerMember ? null : (
              <div className="mt-4">
                <p>Join our discord server to apply for the event.</p>
                <button className="btn bg-discord btn-lg mt-4">
                  <a href="https://discord.gg/7zBQXZqJpH" target="_blank">
                    <DiscordFilled></DiscordFilled> Join Server
                  </a>
                </button>
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => formRef.current?.submit()}
              >
                Apply
              </button>
              <button
                className="btn btn-soft"
                onClick={() => {
                  setModalOpen(false);
                  formRef.current?.resetFields();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
        <button
          className={`btn bg-base-100 h-full hover:text-primary hover:border-primary`}
          onClick={() => {
            setModalOpen(true);
            formRef.current?.resetFields();
          }}
        >
          Apply for Event
        </button>
      </>
    );
  }
};

export default ApplicationButton;
