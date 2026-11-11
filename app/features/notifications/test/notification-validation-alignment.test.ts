import { describe, expect, it } from "vitest";

import type { NotificationCreateRequestDto } from "~/features/notifications/api/dto/admin-notification-dto";
import { parseAdminNotificationListResponse } from "~/features/notifications/api/mappers/admin-notification-response-parser";
import { parseNotificationScheduleDetail } from "~/features/notifications/api/mappers/notification-schedule-response-parser";
import {
  validateNotificationAudienceInput,
  validateNotificationCreateRequest,
  validateNotificationPatchRequest,
  validateNotificationResendRequest,
} from "~/features/notifications/api/mappers/notification-request-validator";
import {
  adminNotificationListFixture,
  cloneFixture,
  notificationScheduleDetailFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { ClientError } from "~/lib/client-error";

const validCreateRequest = {
  content: {
    push: { title: "タイトル", body: "本文" },
    detail: { title: "詳細タイトル", body: "詳細本文" },
  },
  audience: { items: [{ type: "all" as const }] },
  delivery: { type: "immediate" as const, sendAt: null },
  importance: "normal" as const,
} satisfies NotificationCreateRequestDto;

describe("通知Requestの検証をOpenAPI契約に合わせる", () => {
  it("OpenAPIと同じ必須項目・形式のRequestを受け付ける", () => {
    expect(validateNotificationCreateRequest(validCreateRequest)).toBe(
      validCreateRequest
    );
    expect(
      validateNotificationPatchRequest({
        content: { detail: { body: "変更後" } },
      })
    ).toEqual({ content: { detail: { body: "変更後" } } });
  });

  it("未知の項目を拒否する", () => {
    expect(() =>
      validateNotificationCreateRequest({
        ...validCreateRequest,
        extra: true,
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationCreateRequest({
        ...validCreateRequest,
        content: {
          ...validCreateRequest.content,
          push: { ...validCreateRequest.content.push, extra: true },
        },
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationPatchRequest({
        content: { detail: { body: "変更後", extra: true } },
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationResendRequest({
        delivery: validCreateRequest.delivery,
        extra: true,
      } as never)
    ).toThrow(ClientError);
  });

  it("許可されない重要度とAudience項目を拒否する", () => {
    expect(() =>
      validateNotificationCreateRequest({
        ...validCreateRequest,
        importance: "urgent",
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationAudienceInput({
        items: [{ type: "all", targetId: 1 }],
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationAudienceInput({
        items: [{ type: "unknown", targetId: 1 }],
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationAudienceInput({ items: [] } as never)
    ).toThrow(ClientError);
  });

  it("秒・タイムゾーンを含まない予約日時を拒否する", () => {
    expect(() =>
      validateNotificationCreateRequest({
        ...validCreateRequest,
        delivery: {
          type: "scheduled",
          sendAt: "2026-11-07T15:45+09:00",
        },
      } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationCreateRequest({
        ...validCreateRequest,
        delivery: {
          type: "scheduled",
          sendAt: "2026-11-07T15:45:00+09:00",
        },
      } as never)
    ).not.toThrow();
  });

  it("空のPatchとScheduleだけのPatchを拒否する", () => {
    expect(() =>
      validateNotificationPatchRequest({ content: {} } as never)
    ).toThrow(ClientError);
    expect(() =>
      validateNotificationPatchRequest({
        schedule: { notificationScheduleId: 501 },
      } as never)
    ).toThrow(ClientError);
  });
});

describe("通知Responseの検証をOpenAPI契約に合わせる", () => {
  it("OpenAPI形式のResponseを受け付ける", () => {
    expect(
      parseAdminNotificationListResponse(
        cloneFixture(adminNotificationListFixture)
      )
    ).toEqual(adminNotificationListFixture);
    expect(
      parseNotificationScheduleDetail(
        cloneFixture(notificationScheduleDetailFixture)
      )
    ).toEqual(notificationScheduleDetailFixture);
  });

  it("UTC以外の日時と未知の項目を拒否する", () => {
    const offsetDate = cloneFixture(adminNotificationListFixture);
    offsetDate.items[0].schedules[0].sendAt = "2026-11-07T09:20:00+09:00";
    expect(() => parseAdminNotificationListResponse(offsetDate)).toThrow(
      ClientError
    );

    const withExtra = cloneFixture(adminNotificationListFixture) as unknown as {
      items: Array<Record<string, unknown>>;
    };
    withExtra.items[0].extra = true;
    expect(() => parseAdminNotificationListResponse(withExtra)).toThrow(
      ClientError
    );

    const scheduleWithOffsetDate = cloneFixture(
      notificationScheduleDetailFixture
    );
    scheduleWithOffsetDate.sendAt = "2026-11-07T09:20:00+09:00";
    expect(() =>
      parseNotificationScheduleDetail(scheduleWithOffsetDate)
    ).toThrow(ClientError);
  });
});
