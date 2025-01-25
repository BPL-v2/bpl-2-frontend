import { Card, Divider, Tooltip } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { red } from "@ant-design/colors";
import TeamScore from "../components/team-score";
import { CollectionCardTable } from "../components/collection-card-table";
import Meta from "antd/es/card/Meta";
import { getImage } from "../types/scoring-objective";

export function CollectionTab() {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, "Collections");

  if (!category || !currentEvent) {
    return <></>;
  }
  return (
    <>
      <TeamScore category={category}></TeamScore>
      <Divider>{`Collection Goals`}</Divider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {category.objectives.map((objective) => {
          const img_location = getImage(objective);
          return (
            <Card
              key={objective.id}
              size="small"
              styles={{
                body: {
                  // so that the highlight color goes all the way to the edge
                  paddingLeft: "0px",
                  paddingRight: "0px",
                },
              }}
            >
              <Meta
                avatar={
                  img_location ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        maxHeight: "60px",
                      }}
                    >
                      <img
                        src={img_location}
                        style={{
                          height: "100%",
                          maxHeight: "60px",
                          width: "auto",
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )
                }
                style={{
                  height: "100%",
                  maxHeight: "60px",
                  width: "auto",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
                title={
                  <Tooltip title={objective.extra}>
                    <div
                      style={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {`Collect ${objective.required_number} ${objective.name}`}
                      {objective.extra ? (
                        <a style={{ color: red[6] }}>*</a>
                      ) : null}
                    </div>
                  </Tooltip>
                }
              />
              <CollectionCardTable objective={objective} />
            </Card>
          );
        })}
      </div>
    </>
  );
}
