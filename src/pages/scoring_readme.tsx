import { Anchor, Col, Divider, Modal, Row, Typography } from "antd";
import React from "react";
import JSONPretty from "react-json-pretty";

export function ScoringReadmePage() {
  const [exampleModalOpen, setExampleModalOpen] = React.useState(true);
  const [exampleData, setExampleData] = React.useState<any>();
  const [exampleTitle, setExampleTitle] = React.useState<string>();

  return (
    <>
      <Modal
        open={exampleModalOpen}
        footer={null}
        onCancel={() => {
          setExampleModalOpen(false);
        }}
        title={exampleTitle}
        width={"50%"}
        styles={{
          body: {
            textAlign: "left",
            width: "5000px",
          },
        }}
      >
        <JSONPretty data={exampleData} />
      </Modal>
      <Row>
        <Col span={20} style={{ textAlign: "left" }}>
          <h1>Scoring Readme</h1>
          Scoring happens in 3 seperate steps:
          <ul>
            <li>
              <Typography.Link href={"#matching"}>Matching</Typography.Link>:
              describes how a (partial) completion candidate is found
            </li>
            <li>
              <Typography.Link href={"#aggregation"}>
                Aggregation
              </Typography.Link>
              : aggregate these candidates into something that can be scored
            </li>
            <li>
              <Typography.Link href={"#scoring"}>Scoring</Typography.Link>:
              determine if an aggregation satisfies an objective / how the teams
              are ranked according to each other
            </li>
          </ul>
          A typical Objective could look like this
          <pre>
            {`{    
  `}
            <Typography.Link href={"#objective.name"}>name</Typography.Link>
            {`: "First team to gather 500 Scrolls of Wisdom"`}
            {`
  `}
            <Typography.Link href={"#objective.objective_type"}>
              objective_type
            </Typography.Link>
            {`: "Item"`}
            {`
  `}
            <Typography.Link href={"#objective.required_number"}>
              required_number
            </Typography.Link>
            {`: 500`}
            {`
  `}
            <Typography.Link href={"#objective.number_field"}>
              number_field
            </Typography.Link>
            {`: "stack_size"`}
            {`
  `}
            <Typography.Link href={"#objective.aggregation"}>
              aggregation
            </Typography.Link>
            {`: "EARLIEST"`}
            {`
  `}
            <Typography.Link href={"#objective.conditions"}>
              conditions
            </Typography.Link>
            {`: [
    {
      field: "base_type"
      operator: "eq"
      value: "Scroll of Wisdom"
    }
  ]
}`}
          </pre>
          <p>Next we will examine these objective fields in more detail.</p>
          <div id={"matching"}>
            <Divider>{`Matching`}</Divider>
          </div>
          <p>
            Matching is the process of finding candidates that satisfy a partial
            completion of an objective. The following objective fields are
            related to the matching process:
          </p>
          <Typography.Title id={"objective.objective_type"} level={4} code>
            objective_type
          </Typography.Title>
          This describes how we are tracking this objective.
          <ul>
            <li>
              <Typography.Text code>Item</Typography.Text> - Tracked via the
              public stash api
            </li>
            <li>
              <Typography.Text code>Player</Typography.Text> - Tracked via the
              ggg character api
            </li>
            <li>
              <Typography.Text code>Submission</Typography.Text> - Tracked via
              manual player submission
            </li>
          </ul>
          Examples for each of these types are:
          <ul>
            <li>
              <Typography.Text code>Item</Typography.Text> - First team to
              gather 500 Scrolls of Wisdom
            </li>
            <li>
              <Typography.Text code>Player</Typography.Text> - First team to
              have a player reach level 100
            </li>
            <li>
              <Typography.Text code>Submission</Typography.Text> - First team to
              kill the Maven
            </li>
          </ul>
          <Typography.Title id={"objective.number_field"} level={4} code>
            number_field
          </Typography.Title>
          This describes how we are counting the items. Possible values are for
          example:
          <ul>
            <li>
              <Typography.Text code>stack_size</Typography.Text> - Count the
              number of items in the stack (this is the default for items)
            </li>
            <li>
              <Typography.Text code>level</Typography.Text> - Count the level of
              the player
            </li>
            <li>
              <Typography.Text code>depth</Typography.Text> - Count the depth of
              the delve
            </li>
            <li>
              <Typography.Text code>submission_value</Typography.Text> - Used
              when a submission objective has an additional parameter
              <ul>
                <li>
                  Example: "Kill the Maven with as little equipped items as
                  possible" - The submission_value would be the number of
                  equipped
                </li>
              </ul>
            </li>
          </ul>
          <Typography.Title id={"objective.required_number"} level={4} code>
            required_number (optional)
          </Typography.Title>
          This describes the minimum value resulting from the aforementioned
          number field that is required for the objective to be considered
          complete.
          <Typography.Title id={"objective.conditions"} level={4} code>
            conditions
          </Typography.Title>
          A list of conditions that must be satisfied for a match to be
          considered valid. Each condition is an object with the following
          fields:
          <ul>
            <li>
              <Typography.Text code>field</Typography.Text> - The field to check
            </li>
            <li>
              <Typography.Text code>operator</Typography.Text> - The operator to
              apply
            </li>
            <li>
              <Typography.Text code>value</Typography.Text> - The value to check
              against
            </li>
          </ul>
          Examples for conditions are:
          <ul>
            <li>
              Item must be "Scroll of Wisdom"
              <Typography.Text code>
                {
                  "{ field: 'base_type', operator: 'eq', value: 'Scroll of Wisdom' }"
                }
              </Typography.Text>
            </li>
            <li>
              Item must have an item level of at least 82
              <Typography.Text code>
                {"{ field: 'ilvl', operator: 'gte', value: '82' }"}
              </Typography.Text>
            </li>
          </ul>
          <div id={"aggregation"}>
            <Divider>{`Aggregation`}</Divider>
            In the next step, we aggregate the matches into something that can
            be scored later. The following fields are related to the aggregation
            process:
            <Typography.Title id={"objective.aggregation"} level={4} code>
              aggregation
            </Typography.Title>
            Potential options are:
            <ul>
              <li>
                <Typography.Text code>SUM_LATEST</Typography.Text> - Sum up the
                latest match for each player.{" "}
                <Typography.Link
                  onClick={() => {
                    setExampleModalOpen(true);
                    setExampleData({
                      name: "Ream culmulative 3000+ delve depth across the team",
                      objective_type: "Player",
                      number_field: "delve_depth",
                      aggregation: "SUM_LATEST",
                    });
                    setExampleTitle(
                      "Ream culmulative 3000+ delve depth across the team"
                    );
                  }}
                >
                  Example
                </Typography.Link>
              </li>
              <li>
                <Typography.Text code>EARLIEST</Typography.Text> - Pick the
                earliest match per team{" "}
                <Typography.Link
                  onClick={() => {
                    setExampleModalOpen(true);
                    setExampleData({
                      name: "Reach level 95",
                      objective_type: "Player",
                      number_field: "level",
                      aggregation: "EARLIEST",
                      required_number: 95,
                    });
                    setExampleTitle("Reach level 95");
                  }}
                >
                  Example
                </Typography.Link>
              </li>
              <li>
                <Typography.Text code>MAXIMUM</Typography.Text> - Pick the match
                with the highest associated value (see number_field) per team{" "}
                <Typography.Link
                  onClick={() => {
                    setExampleModalOpen(true);
                    setExampleData({
                      name: "Collect the most Wisdom Scrolls",
                      objective_type: "Item",
                      number_field: "stack_size",
                      aggregation: "MAXIMUM",
                      conditions: [
                        {
                          field: "base_type",
                          operator: "eq",
                          value: "Scroll of Wisdom",
                        },
                      ],
                    });
                    setExampleTitle("Collect the most Wisdom Scrolls");
                  }}
                >
                  Example
                </Typography.Link>
              </li>
              <li>
                <Typography.Text code>MINIMUM</Typography.Text> - Pick the match
                with the lowest associated value (see number_field) per team{" "}
                <Typography.Link
                  onClick={() => {
                    setExampleModalOpen(true);
                    setExampleData({
                      name: "Kill the Maven at the lowest possible character level solo",
                      objective_type: "Submission",
                      number_field: "submission_value",
                      aggregation: "MINIMUM",
                    });
                    setExampleTitle(
                      "Kill the Maven at the lowest possible character level solo"
                    );
                  }}
                >
                  Example
                </Typography.Link>
              </li>
              <li>
                <Typography.Text code>EARLIEST_FRESH_ITEM</Typography.Text> -
                This one is a bit more complicated since it depends on how we
                fetch items. as it stands we can not guarantee that if a team
                has an item, it wasn&apos;t traded with another team. so if an
                item is currently not in the possession of a team anymore, we
                might not want to give them points. this aggregation method
                looks for the earliest occurrence of an item, but will also make
                sure that it is still in the possession of the team before it
                counts.{" "}
                <Typography.Link
                  onClick={() => {
                    setExampleModalOpen(true);
                    setExampleData({
                      name: "Collect 5 corrupted Echoforges",
                      objective_type: "Item",
                      number_field: "stack_size",
                      aggregation: "EARLIEST_FRESH_ITEM",
                      required_number: 5,
                      conditions: [
                        {
                          field: "name",
                          operator: "eq",
                          value: "Echoforge",
                        },
                        {
                          field: "corrupted",
                          operator: "eq",
                          value: "true",
                        },
                      ],
                    });
                    setExampleTitle("Collect 5 corrupted Echoforges");
                  }}
                >
                  Example
                </Typography.Link>
              </li>
            </ul>
          </div>
          <div id={"scoring"}>
            <Divider>{`Scoring`}</Divider>
          </div>
          All objectives that grant points have an associated scoring preset.
          <div id={"examples"}>
            <Divider>{`Examples`}</Divider>
          </div>
        </Col>

        <Col span={4}>
          <Anchor
            replace
            items={[
              {
                key: "matching",
                href: "#matching",
                title: "Matching",
              },
              {
                key: "aggregation",
                href: "#aggregation",
                title: "Aggregation",
              },
              {
                key: "scoring",
                href: "#scoring",
                title: "Scoring",
              },
              {
                key: "examples",
                href: "#examples",
                title: "Examples",
              },
            ]}
          />
        </Col>
      </Row>
    </>
  );
}
