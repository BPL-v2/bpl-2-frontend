import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Card, Typography, theme } from "antd";
import Meta from "antd/es/card/Meta";
import TeamScore from "../components/team-score";
import { getSubCategory } from "../types/scoring-category";
import { getTotalPoints } from "../utils/utils";
import { ProgressAvatar } from "../components/progress-avatar";
import { ItemTable } from "../components/item-table";
const { useToken } = theme;

const UniqueTab: React.FC = () => {
  const { currentEvent, eventStatus, scores } = useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
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
        teamScores={getTotalPoints(uniqueCategory)}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {uniqueCategory.sub_categories.map((category) => (
          <Card
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            hoverable
            style={{
              borderColor:
                selectedCategory === category.id ? token.colorPrimary : "",
              borderWidth: 2,
              width: "100%",
            }}
            title={
              <Typography.Title level={4} style={{ margin: 0 }}>
                {category.name}
              </Typography.Title>
            }
            extra={selectedTeam ? getTotalPoints(category)[selectedTeam] : 0}
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
                              acc + subCategory.team_score[selectedTeam].number,
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
        ))}
      </div>
      <ItemTable
        category={uniqueCategory.sub_categories.find(
          (category) => category.id === selectedCategory
        )}
        selectedTeam={selectedTeam}
      />
    </>
  );
};

export default UniqueTab;
