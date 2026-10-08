import { describe, expect, it } from "vitest";

import { toNotificationCreateRequest } from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import { initialNotificationDraft } from "~/features/notifications/model/notification-draft";
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
      detailTitle: " 詳細タイトル ",
      detailBody: " 詳細本文 ",
      importance: "normal",
      audiences: [
        { key: "audience-1", type: audienceType, targetId: audienceId },
      ],
      deliveryTiming: "scheduled",
      scheduledAt: "2026-11-07T15:35",
    };

    const request = toNotificationCreateRequest(draft);

    expect(request).toMatchObject({
      content: {
        push: { title: "タイトル", body: "本文" },
        detail: { title: "詳細タイトル", body: " 詳細本文 " },
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
        detailTitle: "詳細タイトル",
        detailBody: "詳細本文",
        importance: "normal",
        audiences: [{ key: "audience-1", type: "all", targetId: "" }],
        deliveryTiming: "now",
      }).delivery
    ).toEqual({ type: "immediate", sendAt: null });
  });
});

it("詳細本文の字下げと行末空白を保持しPush本文だけtrimする", () => {
  const detailBody = "\n    code\n本文  \n次の行  ";
  const request = toNotificationCreateRequest({
    ...initialNotificationDraft,
    title: "タイトル",
    body: " プッシュ本文 ",
    detailTitle: "詳細タイトル",
    detailBody,
  });
  expect(request.content.detail.body).toBe(detailBody);
  expect(request.content.push.body).toBe("プッシュ本文");
});
