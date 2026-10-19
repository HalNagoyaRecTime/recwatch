import { afterEach, describe, expect, it, vi } from "vitest";

import { createUserManagementHttpApi } from "./http/user-management-http";

const client = {
  delete: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
};

describe("userManagementHttpApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Userの有効状態をuserIdで更新する", async () => {
    client.patch.mockResolvedValue({
      user_id: 12,
      is_live_active: false,
    });
    const api = createUserManagementHttpApi(client);

    await api.updateUserStatus(12, false);

    expect(client.patch).toHaveBeenCalledWith("/api/v1/admin/users/12", {
      is_live_active: false,
    });
  });

  it("staff付与・解除を204として処理する", async () => {
    client.put.mockResolvedValue(undefined);
    client.delete.mockResolvedValue(undefined);
    const api = createUserManagementHttpApi(client);

    await api.grantStaff(12);
    await api.revokeStaff(12);

    expect(client.put).toHaveBeenCalledWith("/api/v1/admin/users/12/staff");
    expect(client.delete).toHaveBeenCalledWith("/api/v1/admin/users/12/staff");
  });
});
