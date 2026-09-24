import { describe, expect, expectTypeOf, it } from "vitest";

import type { NotificationScheduleStatus } from "~/features/notifications/api/dto/notification-v2-api-dto";
import {
  getNotificationValidationErrorDetails,
  isNotificationV2ApiError,
} from "~/features/notifications/api/mappers/notification-v2-api-error";
import { notificationV2ErrorFixtures } from "~/features/notifications/mock/notification-v2-error-fixtures";
import {
  notificationV2RecipientScenarioFixture,
  notificationV2RetryWaitScheduleFixture,
  notificationV2ScheduleStatusFixtures,
} from "~/features/notifications/mock/notification-v2-scenarios";

describe("通知v2 MockシナリオとError契約", () => {
  it("Schedule 6 statusをすべてfixtureで表現する", () => {
    const statuses = notificationV2ScheduleStatusFixtures.map(
      (fixture) => fixture.status
    );

    expect(statuses).toEqual([
      "scheduled",
      "resolving",
      "sending",
      "completed",
      "failed",
      "stopped",
    ]);
    expectTypeOf(statuses).toEqualTypeOf<NotificationScheduleStatus[]>();
  });

  it("TokenなしRecipientと1 User複数Deliveryを区別する", () => {
    const recipients = notificationV2RecipientScenarioFixture.recipients.items;

    expect(recipients[0]?.deliveries).toHaveLength(2);
    expect(recipients[1]?.deliveries).toEqual([]);
    expect(
      notificationV2RetryWaitScheduleFixture.deliveryProgress
    ).toMatchObject({
      totalCount: 3,
      retryWaitCount: 1,
    });
  });

  it("Backendで定義されたError codeだけを通知v2 Errorとして判別する", () => {
    expect(
      isNotificationV2ApiError(notificationV2ErrorFixtures.validation)
    ).toBe(true);
    expect(isNotificationV2ApiError(notificationV2ErrorFixtures.conflict)).toBe(
      true
    );
    expect(
      isNotificationV2ApiError(notificationV2ErrorFixtures.internalServerError)
    ).toBe(false);
  });

  it("VALIDATION_ERRORのfield/form errorを入力表示用に取り出せる", () => {
    expect(
      getNotificationValidationErrorDetails(
        notificationV2ErrorFixtures.validation
      )
    ).toEqual({
      fieldErrors: {
        "content.push.title": ["必須です"],
      },
      formErrors: [],
    });
  });
});
