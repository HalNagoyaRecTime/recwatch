import { describe, expect, it } from "vitest";

import { validateNotificationDraft } from "~/features/notifications/model/notification-draft-validation";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

// 予約入力は実行環境によらず日本時間として検証する。
const now = new Date("2026-11-07T09:00:00+09:00");

function createScheduledDraft(scheduledAt: string): NotificationDraft {
  return {
    title: "タイトル",
    body: "本文",
    detailTitle: "詳細タイトル",
    detailBody: "詳細本文",
    importance: "normal",
    audiences: [{ key: "audience-1", type: "all", targetId: "" }],
    deliveryTiming: "scheduled",
    scheduledAt,
  };
}

describe("validateNotificationDraft", () => {
  it("現在以前の予約日時を拒否する", () => {
    expect(
      validateNotificationDraft(createScheduledDraft("2026-11-07T08:59"), now)
    ).toEqual({ scheduledAt: "schedule_not_future" });
  });

  it("現在より後の予約日時を許可する", () => {
    expect(
      validateNotificationDraft(createScheduledDraft("2026-11-07T09:01"), now)
    ).toEqual({});
  });
});
