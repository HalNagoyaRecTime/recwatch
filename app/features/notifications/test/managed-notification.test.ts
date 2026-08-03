import { describe, expect, it } from "vitest";

import {
  canModifyNotification,
  type ManagedNotification,
} from "../model/managed-notification";

function createNotification(
  deliverySummary: ManagedNotification["deliverySummary"]
): ManagedNotification {
  return {
    id: 1,
    title: "タイトル",
    body: "本文",
    audienceName: "配信対象者（2名）",
    recipientCount: 2,
    scheduledAt: "2026-11-07T09:00:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventId: null,
    relatedEventName: null,
    status: "draft",
    deliverySummary,
    createdAt: "2026-11-07T08:00:00+09:00",
    updatedAt: "2026-11-07T08:00:00+09:00",
  };
}

describe("canModifyNotification", () => {
  it("全配信予定がdraftの場合だけ変更可能にする", () => {
    expect(
      canModifyNotification(
        createNotification({
          total: 2,
          draft: 2,
          sending: 0,
          sent: 0,
          failed: 0,
        })
      )
    ).toBe(true);
    expect(
      canModifyNotification(
        createNotification({
          total: 2,
          draft: 1,
          sending: 1,
          sent: 0,
          failed: 0,
        })
      )
    ).toBe(false);
  });
});
