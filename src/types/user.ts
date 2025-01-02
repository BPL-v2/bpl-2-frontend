export type User = {
  id: number;
  permissions: UserPermission[];
  discord_id?: number;
  discord_name?: string;
  account_name?: string;
  twitch_id?: number;
  twitch_name?: string;
  token_expiry_timestamp?: number;
  display_name: string;
};

export enum UserPermission {
  ADMIN = "admin",
}
