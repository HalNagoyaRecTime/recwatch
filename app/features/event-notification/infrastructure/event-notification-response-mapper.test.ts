import { describe, expect, it } from "vitest";

import { EventNotificationError } from "../application/event-notification-error";
import {
  toEventNotificationSummary,
  toEventPatchResult,
} from "./event-notification-response-mapper";
import {
  createNotificationSummaryResponse,
  createPatchEventResponse,
} from "./event-notification-test-fixture";

describe("event notification response mapper", () => {
  it("PATCH Responseを画面モデルへ正規化する", () => {
    expect(toEventPatchResult(createPatchEventResponse())).toMatchObject({
      event: {
        id: 10,
        name: "走れ！〇人〇脚！",
        startTime: "09:10",
        endTime: "10:10",
      },
      notificationEnabled: true,
      draftNotificationCount: 1,
    });
  });

  it.each([
    [
      {
        scheduled_at: null,
        total: 0,
        draft: 0,
        sending: 0,
        sent: 0,
        failed: 0,
      },
      "none",
      false,
    ],
    [{ total: 2, draft: 2, sending: 0, sent: 0, failed: 0 }, "draft", true],
    [{ total: 2, draft: 0, sending: 2, sent: 0, failed: 0 }, "sending", true],
    [{ total: 2, draft: 0, sending: 0, sent: 2, failed: 0 }, "sent", false],
    [{ total: 2, draft: 0, sending: 0, sent: 1, failed: 1 }, "failed", false],
  ] as const)(
    "集約件数から%s状態を導出する",
    (summary, status, hasUpcomingNotification) => {
      expect(
        toEventNotificationSummary(createNotificationSummaryResponse(summary))
      ).toMatchObject({ status, hasUpcomingNotification });
    }
  );

  it("集約件数が一致しないResponseを拒否する", () => {
    expect(() =>
      toEventNotificationSummary(
        createNotificationSummaryResponse({
          total: 30,
          draft: 29,
        })
      )
    ).toThrow(new EventNotificationError("unexpected"));
  });
});
