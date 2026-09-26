import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import { useNotificationEdit } from "~/features/notifications/hooks/useNotificationEdit";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import { adminNotificationDetailFixture } from "~/features/notifications/mock/notification-fixtures";
import type { AdminNotificationDetail } from "~/features/notifications/model/admin-notification";
import { ApiClientError } from "~/lib/api-client-error";

function createNotification(
  notificationId: number,
  title: string
): AdminNotificationDetail {
  return {
    ...adminNotificationDetailFixture,
    notificationId,
    content: {
      push: { ...adminNotificationDetailFixture.content.push, title },
      detail: { ...adminNotificationDetailFixture.content.detail, title },
    },
  };
}

function createQueryApi(
  getDetail: AdminNotificationQueryApi["getDetail"]
): AdminNotificationQueryApi {
  return { list: vi.fn(), getDetail };
}

const commandApi: AdminNotificationCommandApi = {
  create: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe("useNotificationEdit", () => {
  it("通知本体とAudienceを初回取得し、ID変更時にdraftを切り替える", async () => {
    const getDetail = vi
      .fn<AdminNotificationQueryApi["getDetail"]>()
      .mockResolvedValueOnce(createNotification(1, "1件目"))
      .mockResolvedValueOnce(createNotification(2, "2件目"));
    const load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions);
    const queryApi = createQueryApi(getDetail);
    const audienceApi: NotificationAudienceApi = { load };
    const { result, rerender } = renderHook(
      ({ notificationId }) =>
        useNotificationEdit({
          audienceApi,
          commandApi,
          queryApi,
          notificationId,
        }),
      { initialProps: { notificationId: 1 } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() =>
      expect(result.current.audienceOptions).toEqual(
        mockNotificationAudienceOptions
      )
    );
    expect(result.current.notification?.notificationId).toBe(1);
    expect(result.current.draft.title).toBe("1件目");

    rerender({ notificationId: 2 });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.notification).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notification?.notificationId).toBe(2);
    expect(result.current.draft.title).toBe("2件目");
    expect(getDetail).toHaveBeenNthCalledWith(1, 1);
    expect(getDetail).toHaveBeenNthCalledWith(2, 2);
  });

  it("通知本体の取得失敗をloadErrorへ反映する", async () => {
    const queryApi = createQueryApi(
      vi
        .fn<AdminNotificationQueryApi["getDetail"]>()
        .mockRejectedValue(
          new ApiClientError(404, "通知が見つかりません。", "NOT_FOUND")
        )
    );
    const audienceApi = {
      load: vi.fn().mockResolvedValue(mockNotificationAudienceOptions),
    };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        queryApi,
        notificationId: 99,
      })
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe("通知が見つかりません。");
    expect(result.current.notification).toBeNull();
  });

  it("不正IDはAPIを呼ばずエラー状態を返す", () => {
    const getDetail = vi.fn<AdminNotificationQueryApi["getDetail"]>();
    const queryApi = createQueryApi(getDetail);
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        queryApi,
        notificationId: 0,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadError).toBe("通知IDが不正です。");
    expect(result.current.notification).toBeNull();
    expect(getDetail).not.toHaveBeenCalled();
  });

  it("Audience取得失敗を表示し、reloadで再試行する", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(401, "Audience取得失敗", "UNAUTHORIZED")
      )
      .mockResolvedValueOnce(mockNotificationAudienceOptions);
    const queryApi = createQueryApi(
      vi.fn().mockResolvedValue(createNotification(1, "通知"))
    );
    const audienceApi = { load };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        queryApi,
        notificationId: 1,
      })
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
