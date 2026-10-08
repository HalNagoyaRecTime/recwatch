import { describe, expect, it } from "vitest";

import type { NotificationScheduleListItem } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  getMonitorColumn,
  isMonitorScheduleVisible,
  layoutMonitorSchedules,
  monitorDayMs,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";
import { createNotificationMonitorFixtures } from "~/features/notifications/mock/notification-monitor-api";

const now = Date.parse("2026-10-04T12:00:00+09:00");
const fixture = createNotificationMonitorFixtures(now)[0];
function schedule(
  status: NotificationScheduleListItem["status"],
  offset: number
) {
  return { ...fixture, status, sendAt: new Date(now + offset).toISOString() };
}

describe("配信モニターの表示範囲と位置", () => {
  it.each([
    ["scheduled", -1, false],
    ["scheduled", 0, true],
    ["scheduled", monitorDayMs, true],
    ["scheduled", monitorDayMs + 1, false],
    ["completed", -monitorDayMs - 1, false],
    ["completed", -monitorDayMs, true],
    ["completed", 0, true],
    ["completed", 1, false],
    ["failed", -monitorDayMs, true],
    ["stopped", -monitorDayMs, true],
    ["resolving", -monitorDayMs * 3, true],
    ["sending", monitorDayMs * 3, true],
  ] as const)("%s・境界から%smsの表示は%s", (status, offset, expected) => {
    expect(isMonitorScheduleVisible(schedule(status, offset), now)).toBe(
      expected
    );
  });

  it("offsetが異なる同一時刻を同じ境界として扱う", () => {
    expect(
      isMonitorScheduleVisible(
        { ...fixture, sendAt: "2026-10-05T03:00:00Z" },
        now
      )
    ).toBe(true);
    expect(
      isMonitorScheduleVisible(
        { ...fixture, sendAt: "2026-10-05T12:00:00+09:00" },
        now
      )
    ).toBe(true);
  });

  it.each([
    ["scheduled", 0],
    ["resolving", 1],
    ["sending", 2],
    ["completed", 3],
    ["failed", 3],
    ["stopped", 3],
  ] as const)("%sを列%sへ配置する", (status, column) => {
    expect(getMonitorColumn(status)).toBe(column);
  });

  it("同時刻はID順に並べ、APIの返却順に依存しない", () => {
    const summaries = [
      schedule("sending", 0),
      { ...schedule("sending", 0), notificationScheduleId: 999 },
    ];
    const items: MonitorSchedule[] = summaries.map((summary) => ({
      summary,
      detail: null,
      errorMessage: null,
    }));
    expect(layoutMonitorSchedules(items)).toEqual(
      layoutMonitorSchedules([...items].reverse())
    );
    expect(layoutMonitorSchedules(items).map((node) => node.id)).toEqual([
      String(fixture.notificationScheduleId),
      "999",
    ]);
  });

  it("カードの高さ変更で同じ列の後続カードだけを移動する", () => {
    const items: MonitorSchedule[] = [
      schedule("sending", 0),
      { ...schedule("sending", 1), notificationScheduleId: 999 },
      { ...schedule("scheduled", 1), notificationScheduleId: 1000 },
    ].map((summary) => ({ summary, detail: null, errorMessage: null }));
    const initial = layoutMonitorSchedules(items);
    const resized = layoutMonitorSchedules(items, {
      [fixture.notificationScheduleId]: 600,
    });
    expect(resized[1].position.y - initial[1].position.y).toBe(260);
    expect(resized[2].position).toEqual(initial[2].position);
  });
});
