import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  FormInstance,
  MenuProps,
  Modal,
  Select,
  Space,
  theme,
} from "antd";
import { Team } from "../types/team";
import { EventStatusEnum } from "../types/event";
import {
  submitEventApplication,
  withdrawEventApplication,
} from "../client/signup-client";
import { PlayTime } from "../types/signup";
import { DiscordFilled } from "@ant-design/icons";

const { useToken } = theme;
type ApplicationButtonProps = {};
const ApplicationButton = ({}: ApplicationButtonProps) => {
  let { user, eventStatus, currentEvent, setEventStatus } =
    useContext(GlobalStateContext);
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<FormInstance>(null);
  const [userTeam, setUserTeam] = React.useState<Team | undefined>(undefined);
  const [isServerMember, setIsServerMember] = React.useState(true);
  const token = useToken().token;
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
  if (eventStatus?.application_status === EventStatusEnum.Applied) {
    const items = [
      {
        key: "withdraw",
        danger: true,
        label: "Withdraw Application",
        onClick: () => {
          withdrawEventApplication(currentEvent.id).then(() => {
            setEventStatus({
              ...eventStatus,
              application_status: EventStatusEnum.None,
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

  if (eventStatus?.application_status === EventStatusEnum.None) {
    return (
      <>
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          title="Apply for Event"
          onOk={() => formRef.current?.submit()}
        >
          <Form
            layout="vertical"
            ref={formRef}
            onFinish={(values) => {
              submitEventApplication(currentEvent.id, values)
                .then(() => {
                  setEventStatus({
                    ...eventStatus,
                    application_status: EventStatusEnum.Applied,
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
                  message: "Please select how many hours you can play per day",
                },
              ]}
            >
              <Select>
                {Object.entries(PlayTime).map((entry) => (
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
                    href="/rules"
                    target="_blank"
                    style={{ marginLeft: 4, color: token.colorPrimary }}
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
            <Space>
              {user.discord_id ? null : (
                <Button type="primary" icon={<DiscordFilled></DiscordFilled>}>
                  Link Discord Account
                </Button>
              )}
              {isServerMember ? null : (
                <div>
                  <p>Join our discord server to apply for the event.</p>
                  <Button
                    type="primary"
                    icon={<DiscordFilled></DiscordFilled>}
                    href="https://discord.gg/7zBQXZqJpH"
                    target="_blank"
                  >
                    Join
                  </Button>
                </div>
              )}
            </Space>
          </Form>
        </Modal>
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
