import { describe, expect, it } from "vitest";
import {
  filterNotificationList,
  selectRepresentativeSchedule,
  sortNotificationList,
} from "~/features/notifications/model/notification-list-data";
import { defaultNotificationListFilters } from "~/features/notifications/model/notification-list";
import {
  adminNotificationListFixture,
  cloneFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { formatNotificationScheduleDateTime } from "~/features/notifications/components/list/notification-display";

const now = Date.parse("2026-11-07T00:00:00Z");
describe("通知一覧の絞り込みと代表配信", () => {
  it("複数の検索語を件名・本文・作成者・対象から検索する", () => {
    const filters = {
      ...defaultNotificationListFilters,
      search: "通知101 HAL",
    };
    expect(
      filterNotificationList(
        adminNotificationListFixture.items,
        "all",
        filters,
        now
      ).map((item) => item.notificationId)
    ).toEqual([101]);
  });
  it("状態に一致した配信を選び、元の全配信を削らない", () => {
    const item = cloneFixture(adminNotificationListFixture.items[0]);
    item.schedules[0].status = "completed";
    const filters = {
      ...defaultNotificationListFilters,
      status: "completed" as const,
    };
    expect(filterNotificationList([item], "all", filters, now)).toEqual([item]);
    expect(
      selectRepresentativeSchedule(item, now, filters)?.notificationScheduleId
    ).toBe(item.schedules[0].notificationScheduleId);
    expect(item.schedules).toHaveLength(2);
  });
  it("日本時間の日付境界で今日の配信を絞り込む", () => {
    const item = cloneFixture(adminNotificationListFixture.items[0]);
    item.schedules = [item.schedules[0]];
    item.schedules[0].sendAt = "2026-11-06T15:00:00Z";
    const filters = {
      ...defaultNotificationListFilters,
      dateMode: "today" as const,
    };
    expect(filterNotificationList([item], "all", filters, now)).toHaveLength(1);
    item.schedules[0].sendAt = "2026-11-06T14:59:59Z";
    expect(filterNotificationList([item], "all", filters, now)).toHaveLength(0);
  });
  it("配信予定は絞り込みに一致した配信日時で並べ替える", () => {
    const first = cloneFixture(adminNotificationListFixture.items[0]);
    const second = cloneFixture(adminNotificationListFixture.items[1]);
    first.schedules[0].status = "completed";
    second.schedules[0].status = "completed";
    second.schedules[0].sendAt = "2026-11-07T00:00:00Z";
    const filters = {
      ...defaultNotificationListFilters,
      status: "completed" as const,
    };
    expect(
      sortNotificationList(
        [first, second],
        { columnId: "sendAt", direction: "asc" },
        filters,
        now
      ).map((item) => item.notificationId)
    ).toEqual([second.notificationId, first.notificationId]);
  });
  it("一覧の配信予定は年を省略した日本時間で表示する", () => {
    expect(formatNotificationScheduleDateTime("2026-11-30T03:00:00Z")).toBe(
      "11/30 12:00"
    );
    expect(formatNotificationScheduleDateTime(undefined)).toBe("-");
  });
});
