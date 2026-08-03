import { describe, expect, it, vi } from "vitest";

import { EventNotificationError } from "~/features/event-notification/application/event-notification-error";

import type { EventNotificationGateway } from "~/features/event-notification/application/event-notification-gateway";

import {
  createHttpScheduleManagementGateway,
  type EventManagementHttpClient,
} from "./http-schedule-management-gateway";

function createClient(
  overrides: Partial<EventManagementHttpClient> = {}
): EventManagementHttpClient {
  return {
    get: vi.fn(),
    ...overrides,
  };
}

function createEventNotificationGateway(): EventNotificationGateway {
  return {
    getNotificationSummary: vi.fn(),
    patchEvent: vi.fn(),
  };
}

describe("createHttpScheduleManagementGateway", () => {
  it("一覧取得のHTTPエラーをイベント通知エラーへ変換する", async () => {
    const gateway = createHttpScheduleManagementGateway(
      createClient({ get: vi.fn().mockRejectedValue({ status: 404 }) }),
      createEventNotificationGateway()
    );

    await expect(gateway.list()).rejects.toEqual(
      new EventNotificationError("not_found")
    );
  });

  it("不正なスケジュールIDを入力エラーへ変換する", async () => {
    const gateway = createHttpScheduleManagementGateway(
      createClient(),
      createEventNotificationGateway()
    );

    await expect(gateway.get("invalid-id")).rejects.toEqual(
      new EventNotificationError("invalid_request")
    );
  });
});
