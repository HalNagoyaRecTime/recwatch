import { describe, expect, it } from "vitest";

import { mockNotificationManagementApi } from "~/features/notifications/mock/notification-management-api";

describe("mockNotificationManagementApi", () => {
  it("指定したToken状態を1件でも含む通知を返す", async () => {
    const page = await mockNotificationManagementApi.list({
      sendStatus: "draft",
    });

    expect(page.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 105,
          status: "sending",
          deliverySummary: expect.objectContaining({ draft: 1, sent: 1 }),
        }),
      ])
    );
  });
});
