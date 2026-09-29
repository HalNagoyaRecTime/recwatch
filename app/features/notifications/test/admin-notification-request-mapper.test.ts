import { describe, expect, it } from "vitest";

import { toNotificationCreateRequest } from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

describe("toNotificationCreateRequest", () => {
  it.each([
    ["all", "", { type: "all" }],
    ["class_room", "12", { type: "class_room", targetId: 12 }],
    ["gathering", "23", { type: "gathering", targetId: 23 }],
    ["event", "34", { type: "event", targetId: 34 }],
    ["user", "45", { type: "user", targetId: 45 }],
  ] as const)("%sの対象DTOを作成する", (audienceType, audienceId, expected) => {
    const draft: NotificationDraft = {
      title: " タイトル ",
      body: " 本文 ",
      audienceType,
      audienceId,
      deliveryTiming: "scheduled",
      scheduledAt: "2026-11-07T15:35",
    };

    const request = toNotificationCreateRequest(draft);

    expect(request).toMatchObject({
      content: {
        push: { title: "タイトル", body: "本文" },
        detail: { title: "タイトル", body: "本文" },
      },
      audience: { items: [expected] },
      delivery: { type: "scheduled" },
      importance: "normal",
    });
    expect(request.delivery.sendAt).toMatch(
      /^2026-11-07T15:35:00[+-]\d{2}:\d{2}$/
    );
  });

  it("即時配信ではsendAtをnullにする", () => {
    expect(
      toNotificationCreateRequest({
        title: "タイトル",
        body: "本文",
        audienceType: "all",
        audienceId: "",
        deliveryTiming: "now",
      }).delivery
    ).toEqual({ type: "immediate", sendAt: null });
  });
});
