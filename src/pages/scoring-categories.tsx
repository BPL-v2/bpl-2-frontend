import React from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";

import { Link, useParams } from "react-router-dom";
import { ScoringCategory } from "../types/scoring-category";
import {
  createScoringCategory,
  deleteCategory as deleteScoringCategory,
  fetchCategoryById,
  updateCategory as updateScoringCategory,
} from "../client/category-client";
import { Typography } from "antd";
import { TrashIcon } from "@heroicons/react/24/solid";

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
  {
    title: "Sub Categories",
    dataIndex: "sub_categories",
    key: "sub_categories",
    render: (_, parentCategory) => {
      console.log(parentCategory);
      return parentCategory.sub_categories.map((cat) => {
        return (
          <div className="flex justify-between items-center">
            <Link to={"/scoring-categories/" + cat.id}>{cat.name}</Link>
            <TrashIcon style={{ width: "24px" }} />
          </div>
        );
      });
    },
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
  const categoryIdNum = Number(categoryId);
  const token = "token";
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
          return createScoringCategory(categoryIdNum, data, token);
        }}
        editFunction={async (data) => {
          return updateScoringCategory(categoryIdNum, data, token);
        }}
        deleteFunction={async (data) => {
          return deleteScoringCategory(data, token);
        }}
      />
    </>
  );
};

export default ScoringCategoryPage;
