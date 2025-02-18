import { Anchor, Col, Modal, Row } from "antd";
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
              <a href={"#matching"}>Matching</a>: describes how a (partial)
              completion candidate is found
            </li>
            <li>
              <a href={"#aggregation"}>Aggregation</a>: aggregate these
              candidates into something that can be scored
            </li>
            <li>
              <a href={"#scoring"}>Scoring</a>: determine if an aggregation
              satisfies an objective / how the teams are ranked according to
              each other
            </li>
          </ul>
          A typical Objective could look like this
          <pre>
            {`{    
  `}
            <a href={"#objective.name"}>name</a>
            {`: "First team to gather 500 Scrolls of Wisdom"`}
            {`
  `}
            <a href={"#objective.objective_type"}>objective_type</a>
            {`: "Item"`}
            {`
  `}
            <a href={"#objective.required_number"}>required_number</a>
            {`: 500`}
            {`
  `}
            <a href={"#objective.number_field"}>number_field</a>
            {`: "stack_size"`}
            {`
  `}
            <a href={"#objective.aggregation"}>aggregation</a>
            {`: "EARLIEST"`}
            {`
  `}
            <a href={"#objective.conditions"}>conditions</a>
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
            <div className="divider divider-primary">{"Matching"}</div>
          </div>
          <p>
            Matching is the process of finding candidates that satisfy a partial
            completion of an objective. The following objective fields are
            related to the matching process:
          </p>
          <h4 id={"objective.objective_type"}>objective_type</h4>
          This describes how we are tracking this objective.
          <ul>
            <li>
              <p>Item</p> - Tracked via the public stash api
            </li>
            <li>
              <p>Player</p> - Tracked via the ggg character api
            </li>
            <li>
              <p>Submission</p> - Tracked via manual player submission
            </li>
          </ul>
          Examples for each of these types are:
          <ul>
            <li>
              <p>Item</p> - First team to gather 500 Scrolls of Wisdom
            </li>
            <li>
              <p>Player</p> - First team to have a player reach level 100
            </li>
            <li>
              <p>Submission</p> - First team to kill the Maven
            </li>
          </ul>
          <h4 id={"objective.number_field"}>number_field</h4>
          This describes how we are counting the items. Possible values are for
          example:
          <ul>
            <li>
              <p>stack_size</p> - Count the number of items in the stack (this
              is the default for items)
            </li>
            <li>
              <p>level</p> - Count the level of the player
            </li>
            <li>
              <p>depth</p> - Count the depth of the delve
            </li>
            <li>
              <p>submission_value</p> - Used when a submission objective has an
              additional parameter
              <ul>
                <li>
                  Example: "Kill the Maven with as little equipped items as
                  possible" - The submission_value would be the number of
                  equipped
                </li>
              </ul>
            </li>
          </ul>
          <h1 id={"objective.required_number"}>required_number (optional)</h1>
          This describes the minimum value resulting from the aforementioned
          number field that is required for the objective to be considered
          complete.
          <h1 id={"objective.conditions"}>conditions</h1>A list of conditions
          that must be satisfied for a match to be considered valid. Each
          condition is an object with the following fields:
          <ul>
            <li>
              <p>field</p> - The field to check
            </li>
            <li>
              <p>operator</p> - The operator to apply
            </li>
            <li>
              <p>value</p> - The value to check against
            </li>
          </ul>
          Examples for conditions are:
          <ul>
            <li>
              Item must be "Scroll of Wisdom"
              <p>
                {
                  "{ field: 'base_type', operator: 'eq', value: 'Scroll of Wisdom' }"
                }
              </p>
            </li>
            <li>
              Item must have an item level of at least 82
              <p>{"{ field: 'ilvl', operator: 'gte', value: '82' }"}</p>
            </li>
          </ul>
          <div id={"aggregation"}>
            {" "}
            <div className="divider divider-primary">{"Aggregation"}</div>
            In the next step, we aggregate the matches into something that can
            be scored later. The following fields are related to the aggregation
            process:
            <h1 id={"objective.aggregation"}>aggregation</h1>
            Potential options are:
            <ul>
              <li>
                <p>SUM_LATEST</p> - Sum up the latest match for each player.{" "}
                <a
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
                </a>
              </li>
              <li>
                <p>EARLIEST</p> - Pick the earliest match per team{" "}
                <a
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
                </a>
              </li>
              <li>
                <p>MAXIMUM</p> - Pick the match with the highest associated
                value (see number_field) per team{" "}
                <a
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
                </a>
              </li>
              <li>
                <p>MINIMUM</p> - Pick the match with the lowest associated value
                (see number_field) per team{" "}
                <a
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
                </a>
              </li>
              <li>
                <p>EARLIEST_FRESH_ITEM</p> - This one is a bit more complicated
                since it depends on how we fetch items. as it stands we can not
                guarantee that if a team has an item, it wasn&apos;t traded with
                another team. so if an item is currently not in the possession
                of a team anymore, we might not want to give them points. this
                aggregation method looks for the earliest occurrence of an item,
                but will also make sure that it is still in the possession of
                the team before it counts.{" "}
                <a
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
                </a>
              </li>
            </ul>
          </div>
          <div id={"scoring"}>
            {" "}
            <div className="divider divider-primary">{"Scoring"}</div>
          </div>
          All objectives that grant points have an associated scoring preset.
          <div id={"examples"}>
            {" "}
            <div className="divider divider-primary">{"Examples"}</div>
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
