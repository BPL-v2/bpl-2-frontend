import { Card, Flex } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";

export type SubmissionTabProps = {
  categoryName: string;
};
const gridStyle: React.CSSProperties = {
  width: "49%",
  textAlign: "center",
  margin: 2,
};

export function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, categoryName);

  if (!category || !currentEvent) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );

  return (
    <>
      <Flex wrap gap="small" justify="center" style={{ userSelect: "none" }}>
        {category.objectives.map((objective) => (
          <Card
            key={objective.id}
            style={{
              minWidth: 480,
            }}
            title={
              <div
                style={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {objective.name}
              </div>
            }
            // extra={objective.scoring_preset?.name}
            // size="default"
            // tabBarExtraContent={objective.scoring_preset?.name
          >
            {Object.entries(objective.team_score)
              .sort(([, scoreA], [, scoreB]) => scoreB.points - scoreA.points)
              .map(([teamId, score]) => {
                // const score = objectiveTeamScores[objective.id]?.[team.id];
                return (
                  <Card.Grid
                    style={{
                      ...gridStyle,
                      border: `1px solid ${score.points > 0 ? "lime" : "red"}`,
                    }}
                  >
                    {teamMap[parseInt(teamId)]?.name}
                    {": "}
                    {score ? score.points : 0}
                  </Card.Grid>
                );
              })}
          </Card>
        ))}
      </Flex>
    </>
  );
}
