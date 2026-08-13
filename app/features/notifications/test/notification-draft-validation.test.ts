import { describe, expect, it } from "vitest";

import { validateNotificationDraft } from "~/features/notifications/model/notification-draft-validation";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

// datetime-localの値と同じローカル時刻として基準日時を作る。
const now = new Date(2026, 10, 7, 9, 0);

function createScheduledDraft(scheduledAt: string): NotificationDraft {
  return {
    title: "タイトル",
    body: "本文",
    audienceType: "all",
    audienceId: "",
    deliveryTiming: "scheduled",
    scheduledAt,
  };
}

describe("validateNotificationDraft", () => {
  it("現在以前の予約日時を拒否する", () => {
    expect(
      validateNotificationDraft(createScheduledDraft("2026-11-07T08:59"), now)
    ).toEqual({ scheduledAt: "現在より後の日時を指定してください" });
  });

  it("現在より後の予約日時を許可する", () => {
    expect(
      validateNotificationDraft(createScheduledDraft("2026-11-07T09:01"), now)
    ).toEqual({});
  });
});
