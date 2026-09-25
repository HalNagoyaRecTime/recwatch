import { describe, expect, it, vi } from "vitest";

import { createHttpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { createHttpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { createHttpNotificationConfigApi } from "~/features/notifications/api/http/notification-config-api";
import { createHttpNotificationPushDeliveryApi } from "~/features/notifications/api/http/notification-push-delivery-api";
import { createHttpNotificationScheduleCommandApi } from "~/features/notifications/api/http/notification-schedule-command-api";
import { createHttpNotificationScheduleQueryApi } from "~/features/notifications/api/http/notification-schedule-query-api";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  notificationConfigFixture,
  notificationPushDeliveryDetailFixture,
  notificationScheduleDetailFixture,
  notificationScheduleListFixture,
  notificationScheduleResultsFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { ClientError } from "~/lib/client-error";

describe("notification v2 HTTP adapters", () => {
  it("通知一覧と詳細を取得する", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(adminNotificationListFixture)
      .mockResolvedValueOnce(adminNotificationDetailFixture);
    const api = createHttpAdminNotificationQueryApi({ get });

    await api.list({
      from: "2026-11-07T00:00:00+09:00",
      to: "2026-11-08T00:00:00+09:00",
    });
    await api.getDetail(103);

    expect(get).toHaveBeenNthCalledWith(
      1,
      "/api/v1/admin/notifications?from=2026-11-07T00%3A00%3A00%2B09%3A00&to=2026-11-08T00%3A00%3A00%2B09%3A00"
    );
    expect(get).toHaveBeenNthCalledWith(2, "/api/v1/admin/notifications/103");
  });

  it("fromとtoの片方だけ、または逆転した期間を拒否する", async () => {
    const api = createHttpAdminNotificationQueryApi({ get: vi.fn() });
    await expect(
      api.list({ from: "2026-11-07T00:00:00+09:00" } as never)
    ).rejects.toBeInstanceOf(ClientError);
    await expect(
      api.list({
        from: "2026-11-08T00:00:00+09:00",
        to: "2026-11-07T00:00:00+09:00",
      })
    ).rejects.toBeInstanceOf(ClientError);
  });

  it("作成はPOST、編集はPATCHを使用する", async () => {
    const post = vi.fn().mockResolvedValue({
      notificationId: 108,
      notificationScheduleId: 501,
    });
    const patch = vi.fn().mockResolvedValue(adminNotificationDetailFixture);
    const api = createHttpAdminNotificationCommandApi({
      post,
      patch,
      delete: vi.fn(),
    });
    const request = {
      content: {
        push: { title: "タイトル", body: "本文" },
        detail: { title: "詳細", body: "詳細本文" },
      },
      audience: { items: [{ type: "event" as const, targetId: 81 }] },
      delivery: { type: "immediate" as const, sendAt: null },
      importance: "normal" as const,
    };

    await api.create(request);
    await api.patch(103, {
      content: { detail: { body: "変更後" } },
      schedule: {
        notificationScheduleId: 501,
        audience: { items: [{ type: "gathering", targetId: 51 }] },
        delivery: {
          type: "scheduled",
          sendAt: "2026-11-07T15:45:00+09:00",
        },
      },
    });

    expect(post).toHaveBeenCalledWith("/api/v1/admin/notifications", request);
    expect(patch).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/103",
      expect.objectContaining({ schedule: expect.any(Object) })
    );
  });

  it("Backendが拒否する空contentをPATCH前に拒否する", async () => {
    const patch = vi.fn();
    const api = createHttpAdminNotificationCommandApi({
      post: vi.fn(),
      patch,
      delete: vi.fn(),
    });

    await expect(api.patch(103, { content: {} })).rejects.toBeInstanceOf(
      ClientError
    );
    expect(patch).not.toHaveBeenCalled();
  });

  it("allと他のAudienceの同時指定をPOST前に拒否する", async () => {
    const post = vi.fn();
    const api = createHttpAdminNotificationCommandApi({
      post,
      patch: vi.fn(),
      delete: vi.fn(),
    });

    await expect(
      api.create({
        content: {
          push: { title: "タイトル", body: "本文" },
          detail: { title: "タイトル", body: "本文" },
        },
        audience: {
          items: [{ type: "all" }, { type: "event", targetId: 81 }],
        },
        delivery: { type: "immediate", sendAt: null },
        importance: "normal",
      })
    ).rejects.toBeInstanceOf(ClientError);
    expect(post).not.toHaveBeenCalled();
  });

  it("同じAudienceの重複指定をPOST前に拒否する", async () => {
    const post = vi.fn();
    const api = createHttpAdminNotificationCommandApi({
      post,
      patch: vi.fn(),
      delete: vi.fn(),
    });

    await expect(
      api.create({
        content: {
          push: { title: "タイトル", body: "本文" },
          detail: { title: "タイトル", body: "本文" },
        },
        audience: {
          items: [
            { type: "gathering", targetId: 51 },
            { type: "gathering", targetId: 51 },
          ],
        },
        delivery: { type: "immediate", sendAt: null },
        importance: "normal",
      })
    ).rejects.toBeInstanceOf(ClientError);
    expect(post).not.toHaveBeenCalled();
  });

  it("configとAudience人数を取得する", async () => {
    const get = vi.fn().mockResolvedValue(notificationConfigFixture);
    const post = vi.fn().mockResolvedValue({ recipientCount: 42 });
    const api = createHttpNotificationConfigApi({ get, post });

    await expect(api.getConfig()).resolves.toEqual(notificationConfigFixture);
    await expect(
      api.getAudienceCount({
        audience: { items: [{ type: "user", targetId: 123 }] },
      })
    ).resolves.toEqual({ recipientCount: 42 });
  });

  it("Schedule一覧・詳細・Resultsを取得する", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(notificationScheduleListFixture)
      .mockResolvedValueOnce(notificationScheduleDetailFixture)
      .mockResolvedValueOnce(notificationScheduleResultsFixture);
    const api = createHttpNotificationScheduleQueryApi({ get });

    await api.list();
    await api.getDetail(503);
    await api.getResults(503, { page: 1, limit: 50 });

    expect(get).toHaveBeenNthCalledWith(
      1,
      "/api/v1/admin/notifications/schedules"
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/api/v1/admin/notifications/schedules/503/results?page=1&limit=50"
    );
  });

  it("Schedule再送・停止・取消を同じ契約で実行する", async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        notificationId: 108,
        notificationScheduleId: 509,
      })
      .mockResolvedValueOnce({
        notificationScheduleId: 503,
        status: "stopped",
      });
    const deleteRequest = vi.fn().mockResolvedValue(undefined);
    const api = createHttpNotificationScheduleCommandApi({
      post,
      delete: deleteRequest,
    });

    await api.resend(503, { delivery: { type: "immediate", sendAt: null } });
    await api.stop(503);
    await api.cancel(503);

    expect(post).toHaveBeenNthCalledWith(
      1,
      "/api/v1/admin/notifications/schedules/503/resend",
      { delivery: { type: "immediate", sendAt: null } }
    );
    expect(deleteRequest).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/schedules/503"
    );
  });

  it("Push Delivery詳細を取得する", async () => {
    const get = vi
      .fn()
      .mockResolvedValue(notificationPushDeliveryDetailFixture);
    const api = createHttpNotificationPushDeliveryApi({ get });

    await expect(api.getDetail(9012)).resolves.toEqual(
      notificationPushDeliveryDetailFixture
    );
    expect(get).toHaveBeenCalledWith(
      "/api/v1/admin/notifications/push-deliveries/9012"
    );
  });
});
