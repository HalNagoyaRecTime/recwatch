export interface UserManagementApi {
  updateUserStatus(userId: number, isLiveActive: boolean): Promise<void>;
  grantStaff(userId: number): Promise<void>;
  revokeStaff(userId: number): Promise<void>;
}
