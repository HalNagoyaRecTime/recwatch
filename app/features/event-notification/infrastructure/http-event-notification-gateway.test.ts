import { describe, expect, it, vi } from "vitest";

import { EventNotificationError } from "../application/event-notification-error";
import {
  createHttpEventNotificationGateway,
  type EventNotificationHttpClient,
} from "./http-event-notification-gateway";
import {
  createNotificationSummaryResponse,
  createPatchEventResponse,
} from "./event-notification-test-fixture";

function createClient(
  overrides: Partial<EventNotificationHttpClient> = {}
): EventNotificationHttpClient {
  return {
    get: vi.fn(),
    patch: vi.fn(),
    ...overrides,
  };
}

describe("createHttpEventNotificationGateway", () => {
  it("変更フィールドだけをPATCHする", async () => {
    const patch = vi.fn().mockResolvedValue(createPatchEventResponse());
    const gateway = createHttpEventNotificationGateway(createClient({ patch }));

    await expect(
      gateway.patchEvent({
        eventId: 10,
        startTime: "13:00",
        notificationEnabled: false,
      })
    ).resolves.toMatchObject({ event: { id: 10 } });
    expect(patch).toHaveBeenCalledWith("/api/v1/events/10", {
      start_time: "1300",
      notification_enabled: false,
    });
  });

  it("イベント単位の自動通知集約を取得する", async () => {
    const get = vi.fn().mockResolvedValue(createNotificationSummaryResponse());
    const gateway = createHttpEventNotificationGateway(createClient({ get }));

    await expect(gateway.getNotificationSummary(10)).resolves.toMatchObject({
      eventId: 10,
      status: "draft",
    });
    expect(get).toHaveBeenCalledWith("/api/v1/events/10/notification-summary");
  });

  it.each([
    [400, "invalid_request"],
    [401, "authentication_required"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [500, "unexpected"],
  ] as const)("HTTP %sを%sエラーへ変換する", async (status, kind) => {
    const gateway = createHttpEventNotificationGateway(
      createClient({
        patch: vi.fn().mockRejectedValue({ status }),
      })
    );

    await expect(
      gateway.patchEvent({ eventId: 10, venue: "コートB" })
    ).rejects.toEqual(new EventNotificationError(kind));
  });
});
