import { describe, expect, it } from "vitest";

import { mockAdminNotificationManagementGateway } from "./mock-admin-notification-management-gateway";

describe("mockAdminNotificationManagementGateway", () => {
  it("指定したToken状態を1件でも含む通知を返す", async () => {
    const page = await mockAdminNotificationManagementGateway.list({
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
