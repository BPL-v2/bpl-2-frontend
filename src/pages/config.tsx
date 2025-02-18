import React, { useContext } from "react";

import { GlobalStateContext } from "../utils/context-provider";
import { Permission } from "../client/api";

export const ConfigPage: React.FC = () => {
  const { user } = useContext(GlobalStateContext);
  // const [jobs, setJobs] = React.useState<Job[]>([]);
  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }

  return <div></div>;
};
