import { apiClient } from "~/lib/api-client";
import type { UserManagementApi } from "~/features/user-management/api/contracts/user-management-api";

type UserManagementHttpClient = {
  patch<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete(path: string): Promise<void>;
};

export function createUserManagementHttpApi(
  client: UserManagementHttpClient = apiClient
): UserManagementApi {
  return {
    async updateUserStatus(userId, isLiveActive) {
      await client.patch<unknown>(`/api/v1/admin/users/${userId}`, {
        is_live_active: isLiveActive,
      });
    },
    async grantStaff(userId) {
      await client.put<unknown>(`/api/v1/admin/users/${userId}/staff`);
    },
    async revokeStaff(userId) {
      await client.delete(`/api/v1/admin/users/${userId}/staff`);
    },
  };
}

export const userManagementHttpApi = createUserManagementHttpApi();
