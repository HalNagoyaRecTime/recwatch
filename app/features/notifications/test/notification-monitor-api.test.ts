import { describe, expect, it } from "vitest";

import { createHttpNotificationScheduleQueryApi } from "~/features/notifications/api/http/notification-schedule-query-api";
import {
  createMockNotificationMonitorApi,
  createNotificationMonitorFixtures,
} from "~/features/notifications/mock/notification-monitor-api";

const fixtures = createNotificationMonitorFixtures(
  Date.parse("2026-10-04T12:00:00+09:00")
);

describe("配信モニターのMockとHTTP契約", () => {
  it("同じ一覧・詳細Responseを共有し、一覧へ集計を混入させない", async () => {
    const mock = createMockNotificationMonitorApi(fixtures);
    const list = await mock.list();
    const http = createHttpNotificationScheduleQueryApi({
      async get(path) {
        if (path === "/api/v1/admin/notifications/schedules") return list;
        return mock.getDetail(Number(path.split("/").at(-1)));
      },
    });
    expect(await http.list()).toEqual(list);
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
});
