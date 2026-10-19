import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import type { ManagedNotification } from "~/features/notifications/model/notification";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";

function createNotification(title: string): ManagedNotification {
  return {
    id: 1,
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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function createApi(
  list: NotificationManagementApi["list"]
): NotificationManagementApi {
  return {
    list,
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("useNotificationList", () => {
  it("古いリクエストが後から返っても最新のレスポンスだけを反映する", async () => {
    type NotificationPage = Awaited<
      ReturnType<NotificationManagementApi["list"]>
    >;
    const firstRequest = createDeferred<NotificationPage>();
    const latestRequest = createDeferred<NotificationPage>();
    const list = vi
      .fn<NotificationManagementApi["list"]>()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(latestRequest.promise);
    const api = createApi(list);
    const { result } = renderHook(() => useNotificationList({ api }));

    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));

    act(() => {
      void result.current.reload();
    });
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));

    await act(async () => {
      latestRequest.resolve({
        notifications: [createNotification("最新の通知")],
        total: 1,
        limit: 20,
        offset: 0,
      });
      await latestRequest.promise;
    });
    await waitFor(() =>
      expect(result.current.items[0]?.title).toBe("最新の通知")
    );

    await act(async () => {
      firstRequest.resolve({
        notifications: [createNotification("古い通知")],
        total: 1,
        limit: 20,
        offset: 0,
      });
      await firstRequest.promise;
    });

    expect(result.current.items[0]?.title).toBe("最新の通知");
  });
});
