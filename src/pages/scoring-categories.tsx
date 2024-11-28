import React from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";

import { useParams } from "react-router-dom";
import { ScoringCategory } from "../types/scoring-category";
import {
  createScoringCategory,
  deleteCategory as deleteScoringCategory,
  fetchCategoryById,
  updateCategory as updateScoringCategory,
} from "../client/category-client";
import { Typography } from "antd";
import { router } from "../router";

const columns: CrudColumn<ScoringCategory>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    type: "number",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    type: "text",
    editable: true,
  },
  {
    title: "Inheritance",
    dataIndex: "inheritance",
    key: "inheritance",
    type: "select",
    options: ["OVERWRITE", "INHERIT", "EXTEND"],
    editable: true,
  },
];

const ScoringCategoryPage: React.FC = () => {
  let { categoryId } = useParams();
  let [categoryName, setCategoryName] = React.useState("");
  React.useEffect(() => {
    if (!categoryId) {
      return;
    }
    fetchCategoryById(Number(categoryId)).then((data) => {
      setCategoryName(data.name);
    });
  }, [categoryId]);

  if (!categoryId) {
    return <></>;
  }
  const addtionalActions = {
    "Go to Sub-Categories": async (data: Partial<ScoringCategory>) => {
      router.navigate("/scoring-categories/" + data.id);
    },
  };
  const categoryIdNum = Number(categoryId);
  return (
    <>
      <Typography.Title level={2}>
        {"Sub-Categories for Category: " + categoryName}{" "}
      </Typography.Title>
      <CrudTable<ScoringCategory>
        resourceName="Scoring Category"
        columns={columns}
        fetchFunction={() =>
          fetchCategoryById(categoryIdNum).then((data) => data.sub_categories)
        }
        createFunction={async (data) => {
          return createScoringCategory(categoryIdNum, data);
        }}
        editFunction={updateScoringCategory}
        deleteFunction={deleteScoringCategory}
        addtionalActions={addtionalActions}
      />
    </>
  );
};

export default ScoringCategoryPage;
