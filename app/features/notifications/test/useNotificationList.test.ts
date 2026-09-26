import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  AdminNotificationListResponse,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import { useNotificationList } from "~/features/notifications/hooks/useNotificationList";
import { adminNotificationListFixture } from "~/features/notifications/mock/notification-fixtures";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function createQueryApi(
  list: AdminNotificationQueryApi["list"]
): AdminNotificationQueryApi {
  return { list, getDetail: vi.fn() };
}

const commandApi: AdminNotificationCommandApi = {
  create: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

function createResponse(title: string): AdminNotificationListResponse {
  const item = adminNotificationListFixture.items[0];
  if (!item) return { items: [] };
  return {
    items: [
      {
        ...item,
        content: { push: { ...item.content.push, title } },
      },
    ],
  };
}

describe("useNotificationList", () => {
  it("reloadで通知一覧を再取得する", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponse("初回"))
      .mockResolvedValueOnce(createResponse("再読込後"));
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items[0]?.title).toBe("初回");

    act(() => {
      void result.current.reload();
    });

    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.items[0]?.title).toBe("再読込後")
    );
  });

  it("古いリクエストが後から返っても最新のレスポンスだけを反映する", async () => {
    const firstRequest = createDeferred<AdminNotificationListResponse>();
    const latestRequest = createDeferred<AdminNotificationListResponse>();
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(latestRequest.promise);
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );

    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));
    act(() => {
      void result.current.reload();
    });
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));

    await act(async () => {
      latestRequest.resolve(createResponse("最新の通知"));
      await latestRequest.promise;
    });
    await waitFor(() =>
      expect(result.current.items[0]?.title).toBe("最新の通知")
    );

    await act(async () => {
      firstRequest.resolve(createResponse("古い通知"));
      await firstRequest.promise;
    });
    expect(result.current.items[0]?.title).toBe("最新の通知");
  });
});
