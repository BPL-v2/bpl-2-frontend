export type User = {
  id: number;
  permissions: UserPermission[];
  discord_id: number;
  discord_name: string;
  account_name: string;
};

export enum UserPermission {
  ADMIN = "admin",
}
