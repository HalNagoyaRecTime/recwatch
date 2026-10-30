import { describe, expect, it } from "vitest";

import {
  parseNotificationScheduledAt,
  toNotificationDateTimeInput,
  toNotificationSendAt,
  getMinimumNotificationSchedule,
} from "~/features/notifications/model/notification-schedule-time";
import { canEditNotificationSchedule } from "~/features/notifications/model/notification-edit-policy";

describe("通知の予約日時", () => {
  it("予約の年月日時分を日本時間として保存し、同じ入力値へ戻す", () => {
    const value = "2026-11-07T15:35";
    expect(toNotificationSendAt(value)).toBe("2026-11-07T15:35:00+09:00");
    expect(parseNotificationScheduledAt(value)?.toISOString()).toBe(
      "2026-11-07T06:35:00.000Z"
    );
    expect(toNotificationDateTimeInput("2026-11-07T06:35:00Z")).toBe(value);
  });

  it("日本時間で日付が変わる境界を保持する", () => {
    expect(toNotificationDateTimeInput("2026-11-07T15:01:00Z")).toBe(
      "2026-11-08T00:01"
    );
    expect(
      getMinimumNotificationSchedule(new Date("2026-11-07T14:59:30Z"))
    ).toBe("2026-11-08T00:00");
  });

  it.each([undefined, "", "invalid", "2026-02-30T12:00", "2026-11-07T25:00"])(
    "不正な予約日時を拒否する: %s",
    (value) => {
      expect(parseNotificationScheduledAt(value)).toBeNull();
    }
  );
});

describe("通知の配信設定の編集可否", () => {
  it("配信予定がある未開始の通知だけ編集できる", () => {
    expect(canEditNotificationSchedule([])).toBe(false);
    expect(canEditNotificationSchedule([{ status: "scheduled" }])).toBe(true);
    expect(
      canEditNotificationSchedule([
        { status: "scheduled" },
        { status: "sending" },
      ])
    ).toBe(false);
  });
});
