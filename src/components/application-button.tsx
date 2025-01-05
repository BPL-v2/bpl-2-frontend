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
  theme,
} from "antd";
import { greyDark } from "@ant-design/colors";
import { Team } from "../types/team";
import { EventStatusEnum } from "../types/event";
import {
  submitEventApplication,
  withdrawEventApplication,
} from "../client/signup-client";
import { PlayTime } from "../types/signup";

const { useToken } = theme;
type ApplicationButtonProps = {
  style?: React.CSSProperties;
};
const ApplicationButton = ({ style }: ApplicationButtonProps) => {
  let { user, eventStatus, currentEvent, setEventStatus } =
    useContext(GlobalStateContext);
  const [modalOpen, setModalOpen] = React.useState(false);
  const formRef = React.useRef<FormInstance>(null);
  const [userTeam, setUserTeam] = React.useState<Team | undefined>(undefined);
  const token = useToken().token;
  const buttonStyle = {
    ...style,
    borderRadius: "0",
    borderWidth: "1px",
    borderStyle: "solid",
    background: greyDark[2],
  };
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
    return <Button style={buttonStyle}>{userTeam.name}</Button>;
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
        <Button style={buttonStyle}>Application Pending</Button>
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
            ref={formRef}
            onFinish={(values) => {
              submitEventApplication(currentEvent.id, values).then(() => {
                setEventStatus({
                  ...eventStatus,
                  application_status: EventStatusEnum.Applied,
                });
              });
              setModalOpen(false);
              formRef.current?.resetFields();
            }}
            layout="vertical"
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
                  validator: (rule, value) => {
                    console.log(value);
                    console.log(rule);
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
        </Modal>
        <Button
          style={buttonStyle}
          onClick={() => {
            setModalOpen(true);
            formRef.current?.resetFields();
          }}
        >
          Apply for Event
        </Button>
      </>
    );
  }
};

export default ApplicationButton;
