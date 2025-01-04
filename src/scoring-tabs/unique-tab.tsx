import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Card, Divider, Typography, theme } from "antd";
import Meta from "antd/es/card/Meta";
import TeamScore from "../components/team-score";
import { getSubCategory } from "../types/scoring-category";
import { getPotentialPoints, getTotalPoints } from "../utils/utils";
import { ProgressAvatar } from "../components/progress-avatar";
import { ItemTable } from "../components/item-table";
import { ScoreCategory } from "../types/score";
const { useToken } = theme;

const UniqueTab: React.FC = () => {
  const { currentEvent, eventStatus, scores } = useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  useEffect(() => {
    if (eventStatus) {
      setSelectedTeam(eventStatus.team_id);
    }
  }, [eventStatus]);
  const uniqueCategory = getSubCategory(scores, "Uniques");
  const token = useToken().token;

  if (!uniqueCategory || !currentEvent || !scores) {
    return <></>;
  }

  return (
    <>
      <TeamScore
        category={uniqueCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      <Divider
        style={{ borderColor: token.colorPrimary }}
      >{`Categories`}</Divider>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {uniqueCategory.sub_categories.map((category) => {
          return (
            <Card
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              hoverable
              style={{
                borderColor:
                  selectedCategory?.id === category.id
                    ? token.colorPrimary
                    : "transparent",
                borderWidth: 4,
                width: "100%",
              }}
              title={
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {category.name}
                </Typography.Title>
              }
              extra={
                selectedTeam
                  ? `${getTotalPoints(category)[selectedTeam]} / ${
                      getPotentialPoints(category)[selectedTeam]
                    }`
                  : null
              }
            >
              <Meta
                avatar={
                  <ProgressAvatar
                    category={category}
                    teamId={selectedTeam}
                    size={64}
                  ></ProgressAvatar>
                }
                description={
                  <>
                    <div style={{ fontSize: 18 }}>
                      {"Uniques: " +
                        (selectedTeam
                          ? category.team_score[selectedTeam].number
                          : 0) +
                        " / " +
                        category.objectives.length}
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {"Variants: " +
                        (selectedTeam
                          ? category.sub_categories.reduce(
                              (acc, subCategory) =>
                                acc +
                                subCategory.team_score[selectedTeam].number,
                              0
                            )
                          : 0) +
                        " / " +
                        category.sub_categories.reduce(
                          (acc, subCategory) =>
                            acc + subCategory.objectives.length,
                          0
                        )}
                    </div>
                  </>
                }
              />
            </Card>
          );
        })}
      </div>
      <Divider style={{ borderColor: token.colorPrimary }}>{`${
        selectedCategory?.name || "Unique"
      } Items`}</Divider>

      <ItemTable
        category={selectedCategory || uniqueCategory}
        selectedTeam={selectedTeam}
      />
    </>
  );
};

export default UniqueTab;
