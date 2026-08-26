import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { NotificationManagementError } from "~/features/notifications/api/contracts/errors/notification-management-error";
import {
  createHttpNotificationManagementApi,
  type AdminNotificationManagementHttpClient,
} from "~/features/notifications/api/http/notification-management-api";
import { createNotificationResponse } from "~/features/notifications/test/fixtures/admin-notification-management-response";

function createClient(
  overrides: Partial<AdminNotificationManagementHttpClient> = {}
): AdminNotificationManagementHttpClient {
  return {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("createHttpNotificationManagementApi", () => {
  it("通知管理を取得する", async () => {
    const get = vi.fn().mockResolvedValue({
      notifications: [createNotificationResponse()],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const gateway = createHttpNotificationManagementApi(createClient({ get }));

    await expect(gateway.list({ sendStatus: "draft" })).resolves.toMatchObject({
      total: 1,
      notifications: [{ id: 10, status: "draft" }],
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/admin/notifications?sendStatus=draft"
    );
  });

  it("通知詳細を取得する", async () => {
    const get = vi.fn().mockResolvedValue(createNotificationResponse());
    const gateway = createHttpNotificationManagementApi(createClient({ get }));

    await expect(gateway.getById(10)).resolves.toMatchObject({ id: 10 });
    expect(get).toHaveBeenCalledWith("/api/v1/admin/notifications/10");
  });

  it("未送信通知を更新する", async () => {
    const put = vi.fn().mockResolvedValue(
      createNotificationResponse({
        title: "変更後",
      })
    );
    const gateway = createHttpNotificationManagementApi(createClient({ put }));

    await expect(
      gateway.update(10, {
        title: " 変更後 ",
        audience: { type: "class_room", classRoomId: 3 },
      })
    ).resolves.toMatchObject({ title: "変更後" });
    expect(put).toHaveBeenCalledWith("/api/v1/admin/notifications/10", {
      title: "変更後",
      audience: { type: "class_room", classRoomId: 3 },
    });
  });

  it("未送信通知を削除する", async () => {
    const deleteRequest = vi.fn().mockResolvedValue(undefined);
    const gateway = createHttpNotificationManagementApi(
      createClient({ delete: deleteRequest })
    );

    await expect(gateway.delete(10)).resolves.toBeUndefined();
    expect(deleteRequest).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/10"
    );
  });

  it("409を競合エラーへ変換する", async () => {
    const gateway = createHttpNotificationManagementApi(
      createClient({
        delete: vi
          .fn()
          .mockRejectedValue(new ApiClientError(409, "Notification is in use")),
      })
    );

    await expect(gateway.delete(10)).rejects.toEqual(
      new NotificationManagementError("conflict")
    );
  });
});
