import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpNotificationScheduleQueryApi } from "~/features/notifications/api/http/notification-schedule-query-api";
import {
  createMockNotificationMonitorApi,
  createNotificationMonitorFixtures,
} from "~/features/notifications/mock/notification-monitor-api";

const fixtures = createNotificationMonitorFixtures(
  Date.parse("2026-10-04T12:00:00+09:00")
);

afterEach(() => vi.restoreAllMocks());

describe("配信モニターのMockとHTTP契約", () => {
  it("同じ一覧・詳細Responseを共有し、一覧へ集計を混入させない", async () => {
    const mock = createMockNotificationMonitorApi(fixtures);
    const query = {
      from: "2026-10-03T03:00:00.000Z",
      to: "2026-10-05T03:00:00.000Z",
    };
    const list = await mock.list(query);
    const http = createHttpNotificationScheduleQueryApi({
      async get(path) {
        if (path.startsWith("/api/v1/admin/notifications/schedules?"))
          return list;
        return mock.getDetail(Number(path.split("/").at(-1)));
      },
    });
    expect(await http.list(query)).toEqual(list);
    for (const fixture of fixtures) {
      expect(await http.getDetail(fixture.notificationScheduleId)).toEqual(
        await mock.getDetail(fixture.notificationScheduleId)
      );
    }
    expect(list.items[0]).not.toHaveProperty("deliveryProgress");
  });

  it("削除済みScheduleは404を返す", async () => {
    await expect(
      createMockNotificationMonitorApi(fixtures).getDetail(999)
    ).rejects.toMatchObject({
      status: 404,
      code: "NOTIFICATION_SCHEDULE_NOT_FOUND",
    });
  });
  it("Mockも送信時刻の期間で絞り込み、進行中でも期間外は返さない", async () => {
    const items = createNotificationMonitorFixtures(
      Date.parse("2026-10-04T12:00:00+09:00")
    );
    items[0].status = "sending";
    items[0].sendAt = "2026-10-03T14:59:59.999Z";
    items[1].sendAt = "2026-10-03T15:00:00.000Z";
    items[2].sendAt = "2026-10-04T14:59:59.999Z";
    items[3].sendAt = "2026-10-04T15:00:00.000Z";
    const response = await createMockNotificationMonitorApi(items).list({
      from: "2026-10-03T15:00:00Z",
      to: "2026-10-04T14:59:59.999Z",
    });
    expect(response.items.map((item) => item.notificationScheduleId)).toEqual(
      items
        .filter((_, index) => index !== 0 && index !== 3)
        .map((item) => item.notificationScheduleId)
    );
  });

  it("期間未指定のMockは本番と同じJST当日だけ返す", async () => {
    const at = Date.parse("2026-10-04T23:30:00+09:00");
    vi.spyOn(Date, "now").mockReturnValue(at);
    const items = createNotificationMonitorFixtures(at);
    items[0].sendAt = "2026-10-05T00:00:00+09:00";
    items[1].sendAt = "2026-10-03T23:59:59+09:00";
    const response = await createMockNotificationMonitorApi(items).list();
    expect(response.items.map((item) => item.notificationScheduleId)).toEqual(
      items.slice(2).map((item) => item.notificationScheduleId)
    );
  });
});
