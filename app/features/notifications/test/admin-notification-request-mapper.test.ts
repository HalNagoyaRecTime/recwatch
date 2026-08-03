import { describe, expect, it } from "vitest";

import type { NotificationDraft } from "../model/notification-draft";
import { toCreateAdminNotificationRequest } from "../infrastructure/admin-notification-request-mapper";

const scheduledAt = new Date("2026-11-07T09:00:00+09:00");

describe("toCreateAdminNotificationRequest", () => {
  it.each([
    ["all", "", { type: "all" }],
    ["class_room", "12", { type: "class_room", classRoomId: 12 }],
    ["gathering", "23", { type: "gathering", gatheringId: 23 }],
    ["event_participants", "34", { type: "event_participants", eventId: 34 }],
  ] as const)(
    "%s の通知対象をAPI Requestへ変換する",
    (audienceType, audienceId, audience) => {
      const draft: NotificationDraft = {
        title: "  タイトル  ",
        body: "  本文  ",
        audienceType,
        audienceId,
      };

      expect(toCreateAdminNotificationRequest(draft, scheduledAt)).toEqual({
        title: "タイトル",
        body: "本文",
        audience,
        scheduledAt: "2026-11-07T00:00:00.000Z",
      });
    }
  );
});
