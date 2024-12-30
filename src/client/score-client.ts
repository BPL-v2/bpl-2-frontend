import useSWR from "swr";
import { Score } from "../types/score";
import { fetchWrapper } from "./base";

export const fetchScores = () => {
  const { data, ...restSWR } = useSWR(
    "scores",
    () => fetchWrapper<Score[]>(`/scores/latest`, "GET"),
    {
      refreshInterval: 60000,
      revalidateIfStale: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    ...restSWR,
    scoreData: data,
  };
};
