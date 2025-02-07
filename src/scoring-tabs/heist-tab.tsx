import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import TeamScore from "../components/team-score";
import { ItemTable } from "../components/item-table";

export const HeistTab: React.FC = () => {
  const { scores } = useContext(GlobalStateContext);
  const heistCategory = scores?.sub_categories.find(
    (category) => category.name === "Heist"
  );

  if (!heistCategory) {
    return <></>;
  }
  return (
    <>
      <TeamScore category={heistCategory} />
      {heistCategory.sub_categories.map((category) => {
        return (
          <div key={"table-" + category.name}>
            <div className="divider divider-primary">{category.name}</div>
            <ItemTable category={category} />
          </div>
        );
      })}
    </>
  );
};
