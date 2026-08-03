import { describe, expect, it } from "vitest";

import { toAdminNotificationListPath } from "../infrastructure/admin-notification-list-query-mapper";

describe("toAdminNotificationListPath", () => {
  it("一覧条件をBackendのQueryへ変換する", () => {
    expect(
      toAdminNotificationListPath({
        sendStatus: "draft",
        eventId: 3,
        from: "2026-11-07T09:00:00+09:00",
        to: "2026-11-07T10:00:00+09:00",
        limit: 20,
        offset: 40,
      })
    ).toBe(
      "/api/v1/admin/notifications?" +
        "sendStatus=draft&eventId=3&" +
        "from=2026-11-07T09%3A00%3A00%2B09%3A00&" +
        "to=2026-11-07T10%3A00%3A00%2B09%3A00&limit=20&offset=40"
    );
  });
});
