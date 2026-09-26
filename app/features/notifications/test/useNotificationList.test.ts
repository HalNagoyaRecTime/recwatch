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

function createResponseWithCount(
  count: number,
  titlePrefix: string
): AdminNotificationListResponse {
  const item = adminNotificationListFixture.items[0];
  if (!item) return { items: [] };
  return {
    items: Array.from({ length: count }, (_, index) => ({
      ...item,
      notificationId: item.notificationId + index,
      content: {
        push: { ...item.content.push, title: titlePrefix + index },
      },
    })),
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

  it("queryApiが変わると新しいAPIで一覧を取得する", async () => {
    const firstList = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponse("最初のAPI"));
    const nextList = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponse("新しいAPI"));
    const firstApi = createQueryApi(firstList);
    const nextApi = createQueryApi(nextList);
    const { result, rerender } = renderHook(
      ({ queryApi }: { queryApi: AdminNotificationQueryApi }) =>
        useNotificationList({ commandApi, queryApi }),
      { initialProps: { queryApi: firstApi } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items[0]?.title).toBe("最初のAPI");

    rerender({ queryApi: nextApi });
    await waitFor(() => expect(nextList).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.items[0]?.title).toBe("新しいAPI")
    );
    expect(firstList).toHaveBeenCalledTimes(1);
  });

  it("削除後の再取得で件数が減っても存在しないページを表示しない", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponseWithCount(21, "通知"))
      .mockResolvedValueOnce(createResponseWithCount(1, "残った通知"));
    const queryApi = createQueryApi(list);
    const deleteNotification = vi.fn().mockResolvedValue(undefined);
    const deleteApi: AdminNotificationCommandApi = {
      ...commandApi,
      delete: deleteNotification,
    };
    const { result } = renderHook(() =>
      useNotificationList({ commandApi: deleteApi, queryApi })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.onPageChange(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.items[0]?.title).toBe("通知20");

    const itemToDelete = result.current.items[0];
    if (!itemToDelete) throw new Error("削除対象がありません");
    act(() => result.current.onDeleteRequest(itemToDelete));
    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(deleteNotification).toHaveBeenCalledWith(121);
    expect(list).toHaveBeenCalledTimes(2);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.items[0]?.title).toBe("残った通知0");
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
