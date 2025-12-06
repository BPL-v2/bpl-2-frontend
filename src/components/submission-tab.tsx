import { ObjectiveType } from "@client/api";
import { Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect } from "react";
import { SubmissionCard } from "./cards/submission-card";
import TeamScoreDisplay from "./team/team-score";
import { CollectionCard } from "./cards/collection-card";

export type SubmissionTabProps = {
  categoryName: string;
};

function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { scores } = useContext(GlobalStateContext);
  const category = scores?.children.find((cat) => cat.name === categoryName);

  useEffect(() => {
    category?.children
      .filter(
        (objective) => objective.objective_type == ObjectiveType.SUBMISSION,
      )
      .forEach((objective) => {
        console.log("Submission Objective:", objective);
      });
  }, [category]);

  if (!category) {
    return <></>;
  }
  return (
    <div className="flex flex-col gap-4">
      <TeamScoreDisplay objective={category}></TeamScoreDisplay>
      <h1 className="text-xl">
        Click to see all{" "}
        <Link
          to={"/submissions"}
          className="cursor-pointer text-primary underline"
        >
          Submissions
        </Link>
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {category.children
          .filter(
            (objective) => objective.objective_type == ObjectiveType.SUBMISSION,
          )
          .map((objective) => {
            return <SubmissionCard key={objective.id} objective={objective} />;
          })}
        {category.children
          .filter(
            (objective) => objective.objective_type != ObjectiveType.SUBMISSION,
          )
          .map((objective) => (
            <CollectionCard key={objective.id} objective={objective} />
          ))}
      </div>
    </div>
  );
}

export default SubmissionTab;
