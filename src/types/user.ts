export type UserMapResponse = {
  [teamId: string]: { id: number; display_name: string }[];
};

export type MinimalTeamUser = {
  id: number;
  display_name: string;
  team_id: number;
};
