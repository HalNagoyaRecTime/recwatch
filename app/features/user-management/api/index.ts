import { userManagementHttpApi } from "./http/user-management-http";
import type { UserManagementApi } from "./contracts/user-management-api";

export const userManagementApi: UserManagementApi = userManagementHttpApi;

export type { UserManagementApi } from "./contracts/user-management-api";
