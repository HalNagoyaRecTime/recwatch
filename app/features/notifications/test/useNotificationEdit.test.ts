import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { ApiClientError } from "~/lib/api-client-error";
import { useNotificationEdit } from "~/features/notifications/hooks/useNotificationEdit";
import type { ManagedNotification } from "~/features/notifications/model/notification";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";

function createNotification(id: number, title: string): ManagedNotification {
  return {
    id,
    title,
    body: "本文",
    audienceName: "配信対象者",
    recipientCount: 1,
    scheduledAt: "2026-11-07T09:00:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventId: null,
    relatedEventName: null,
    status: "draft",
    deliverySummary: {
      total: 1,
      draft: 1,
      sending: 0,
      sent: 0,
      failed: 0,
    },
    createdAt: "2026-11-07T08:00:00+09:00",
    updatedAt: "2026-11-07T08:00:00+09:00",
  };
}

function createManagementApi(
  getById: NotificationManagementApi["getById"]
): NotificationManagementApi {
  return {
    list: vi.fn(),
    getById,
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("useNotificationEdit", () => {
  it("通知本体とAudienceを初回取得し、ID変更時にdraftを切り替える", async () => {
    const first = createNotification(1, "1件目");
    const second = createNotification(2, "2件目");
    const getById = vi
      .fn<NotificationManagementApi["getById"]>()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions);
    const api = createManagementApi(getById);
    const audienceApi: NotificationAudienceApi = { load };
    const { result, rerender } = renderHook(
      ({ notificationId }) =>
        useNotificationEdit({ api, audienceApi, notificationId }),
      { initialProps: { notificationId: 1 } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() =>
      expect(result.current.audienceOptions).toEqual(
        mockNotificationAudienceOptions
      )
    );
    expect(result.current.notification?.id).toBe(1);
    expect(result.current.draft.title).toBe("1件目");

    rerender({ notificationId: 2 });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.notification).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notification?.id).toBe(2);
    expect(result.current.draft.title).toBe("2件目");
    expect(getById).toHaveBeenNthCalledWith(1, 1);
    expect(getById).toHaveBeenNthCalledWith(2, 2);
  });

  it("通知本体の取得失敗をloadErrorへ反映する", async () => {
    const api = createManagementApi(
      vi
        .fn<NotificationManagementApi["getById"]>()
        .mockRejectedValue(
          new ApiClientError(404, "通知が見つかりません。", "NOT_FOUND")
        )
    );
    const audienceApi = {
      load: vi.fn().mockResolvedValue(mockNotificationAudienceOptions),
    };
    const { result } = renderHook(() =>
      useNotificationEdit({ api, audienceApi, notificationId: 99 })
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe("通知が見つかりません。");
    expect(result.current.notification).toBeNull();
  });

  it("不正IDはAPIを呼ばずエラー状態を返す", () => {
    const getById = vi.fn<NotificationManagementApi["getById"]>();
    const api = createManagementApi(getById);
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const { result } = renderHook(() =>
      useNotificationEdit({ api, audienceApi, notificationId: 0 })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadError).toBe("通知IDが不正です。");
    expect(result.current.notification).toBeNull();
    expect(getById).not.toHaveBeenCalled();
  });

  it("Audience取得失敗を表示し、reloadで再試行する", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(401, "Audience取得失敗", "UNAUTHORIZED")
      )
      .mockResolvedValueOnce(mockNotificationAudienceOptions);
    const api = createManagementApi(
      vi.fn().mockResolvedValue(createNotification(1, "通知"))
    );
    const audienceApi = { load };
    const { result } = renderHook(() =>
      useNotificationEdit({ api, audienceApi, notificationId: 1 })
    );

    await waitFor(() =>
      expect(result.current.audienceError).toBe("Audience取得失敗")
    );

    act(() => result.current.onAudienceReload());

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.audienceOptions).toEqual(
        mockNotificationAudienceOptions
      )
    );
    expect(result.current.audienceError).toBeNull();
  });
});
