import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  AdminNotificationListResponse,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import { ApiClientError } from "~/lib/api-client-error";
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

function createResponse(
  title: string,
  page = 1,
  limit = 50
): AdminNotificationListResponse {
  const item = adminNotificationListFixture.items[0];
  if (!item)
    return {
      items: [],
      pagination: { page, limit, totalCount: 0, totalPages: 1 },
    };
  return {
    items: [
      {
        ...item,
        content: { push: { ...item.content.push, title } },
      },
    ],
    pagination: { page, limit, totalCount: 1, totalPages: 1 },
  };
}

function createResponseWithCount(
  count: number,
  titlePrefix: string,
  page = 1,
  limit = 50
): AdminNotificationListResponse {
  const item = adminNotificationListFixture.items[0];
  if (!item)
    return {
      items: [],
      pagination: { page, limit, totalCount: 0, totalPages: 1 },
    };
  const items = Array.from({ length: count }, (_, index) => ({
    ...item,
    notificationId: item.notificationId + index,
    content: {
      push: { ...item.content.push, title: titlePrefix + index },
    },
  }));
  return {
    items,
    pagination: {
      page,
      limit,
      totalCount: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    },
  };
}

describe("useNotificationList", () => {
  it("カレンダーでは一覧を取得せず、一覧に戻ると取得する", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValue(createResponse("通知"));
    const queryApi = createQueryApi(list);
    const calendarRange = {
      from: "2026-11-01T00:00:00.000+09:00",
      to: "2026-11-30T23:59:59.999+09:00",
    };
    const { result, rerender } = renderHook(
      ({ listEnabled }) =>
        useNotificationList({
          commandApi,
          queryApi,
          listEnabled,
          calendarRange: listEnabled ? undefined : calendarRange,
        }),
      { initialProps: { listEnabled: false } }
    );
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));
    expect(list).toHaveBeenCalledWith({ ...calendarRange, page: 1, limit: 50 });
    act(() => result.current.onCreationMethodChange("manual"));
    await act(async () => {
      await Promise.resolve();
    });
    expect(list).toHaveBeenCalledTimes(1);
    rerender({ listEnabled: true });
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(list.mock.calls[1][0]).toMatchObject({
      creationMethod: "manual",
      page: 1,
    });
  });

  it("カレンダーへ移動した後に返った一覧応答を反映しない", async () => {
    const pending = createDeferred<AdminNotificationListResponse>();
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue(createResponse("カレンダー"));
    const queryApi = createQueryApi(list);
    const { result, rerender } = renderHook(
      ({ listEnabled }) =>
        useNotificationList({ commandApi, queryApi, listEnabled }),
      { initialProps: { listEnabled: true } }
    );
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));
    rerender({ listEnabled: false });
    await act(async () => {
      pending.resolve(createResponse("古い一覧"));
      await pending.promise;
    });
    expect(result.current.items).toEqual([]);
  });

  it("1ページ目にない通知も検索結果と総件数に表示する", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockImplementation(async (query) => {
        if (query?.search === "needle") return createResponse("51件目のneedle");
        return {
          ...createResponseWithCount(50, "通知"),
          pagination: { page: 1, limit: 50, totalCount: 51, totalPages: 2 },
        };
      });
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );
    await waitFor(() => expect(result.current.totalItems).toBe(51));
    act(() =>
      result.current.onFiltersChange({
        search: "needle",
        status: "all",
        dateMode: "all",
        from: "",
        to: "",
      })
    );
    await waitFor(() =>
      expect(result.current.items[0]?.content.push.title).toBe("51件目のneedle")
    );
    expect(result.current.totalItems).toBe(1);
    expect(result.current.pageCount).toBe(1);
  });
  it("ページ取得中に検索条件を変えても古いページを表示しない", async () => {
    const pending = createDeferred<AdminNotificationListResponse>();
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockImplementation(async (query) => {
        if (query?.search === "needle") return createResponse("検索結果");
        if (query?.page === 2) return pending.promise;
        return createResponseWithCount(51, "通知");
      });
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.onPageChange(2));
    await waitFor(() =>
      expect(list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    );
    act(() =>
      result.current.onFiltersChange({
        search: "needle",
        status: "all",
        dateMode: "all",
        from: "",
        to: "",
      })
    );
    await waitFor(() =>
      expect(result.current.items[0]?.content.push.title).toBe("検索結果")
    );
    await act(async () => {
      pending.resolve(createResponse("古いページ", 2));
      await pending.promise;
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.items[0]?.content.push.title).toBe("検索結果");
  });
  it("検索・絞り込み・並べ替えを一覧APIに送り直す", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValue(createResponse("該当"));
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.onFiltersChange({
        search: "needle",
        status: "failed",
        dateMode: "date",
        from: "2026-10-10",
        to: "",
      })
    );
    act(() => result.current.onCreationMethodChange("manual"));
    act(() => result.current.onSortChange("title"));
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 50,
          search: "needle",
          status: "failed",
          creationMethod: "manual",
          filterFrom: "2026-10-10T00:00:00.000+09:00",
          filterTo: "2026-10-10T23:59:59.999+09:00",
          sortBy: "title",
          sortDirection: "asc",
        })
      )
    );
  });
  it("一覧は過去と未来の通知を全期間の条件で取得する", async () => {
    const example = adminNotificationListFixture.items[0];
    const schedule = example?.schedules[0];
    if (!example || !schedule) throw new Error("通知fixtureがありません");
    const records = [
      "2020-01-01T00:00:00.000Z",
      "2030-01-01T00:00:00.000Z",
    ].map((sendAt, index) => ({
      ...example,
      notificationId: index + 1,
      schedules: [{ ...schedule, sendAt }],
    }));
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockImplementation(async (query) => {
        const items = records.filter((item) =>
          item.schedules.some(
            (s) =>
              s.sendAt >= (query?.from ?? "2026") &&
              s.sendAt <= (query?.to ?? "2026")
          )
        );
        return {
          items,
          pagination: {
            page: 1,
            limit: 50,
            totalCount: items.length,
            totalPages: 1,
          },
        };
      });
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.map((item) => item.notificationId)).toEqual([
      1, 2,
    ]);
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "0001-01-01T00:00:00.000Z",
        to: "9999-12-31T23:59:59.999Z",
      })
    );
  });

  it("カレンダーは月内の2ページ目も取得する", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockImplementation(async (query) => {
        if (query?.from?.startsWith("2026-10")) {
          const page = query.page ?? 1;
          return {
            ...createResponseWithCount(page === 1 ? 50 : 1, `月${page}-`, page),
            pagination: { page, limit: 50, totalCount: 51, totalPages: 2 },
          };
        }
        return createResponse("一覧");
      });
    const queryApi = createQueryApi(list);
    const calendarMonth = new Date(2026, 9, 1);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi, calendarMonth })
    );
    await waitFor(() =>
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50,
          from: expect.stringContaining("2026-10"),
        })
      )
    );
    await waitFor(() => expect(result.current.isCalendarLoading).toBe(false));
    expect(result.current.calendarItems).toHaveLength(51);
  });
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
    expect(result.current.items[0]?.content.push.title).toBe("初回");

    act(() => {
      void result.current.reload();
    });

    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.items[0]?.content.push.title).toBe("再読込後")
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
    expect(result.current.items[0]?.content.push.title).toBe("最初のAPI");

    rerender({ queryApi: nextApi });
    await waitFor(() => expect(nextList).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.items[0]?.content.push.title).toBe("新しいAPI")
    );
    expect(firstList).toHaveBeenCalledTimes(1);
  });

  it("削除後の再取得で件数が減っても存在しないページを表示しない", async () => {
    // 2ページ目に1件だけある状態で削除し、1ページ目に戻ることを確認
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponseWithCount(51, "通知", 1, 50))
      .mockResolvedValueOnce({
        ...createResponseWithCount(1, "通知", 2, 50),
        pagination: { page: 2, limit: 50, totalCount: 51, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 2, limit: 50, totalCount: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce(createResponseWithCount(1, "残った通知", 1, 50));
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
    // 2ページ目に移動
    act(() => result.current.onPageChange(2));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // 2ページ目のデータが返っていることを確認
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.content.push.title).toBe("通知0");

    // 削除処理を確認（scheduled状態のitemのみ削除可能）
    const itemToDelete = result.current.items[0];
    if (!itemToDelete) throw new Error("削除対象がありません");
    act(() => result.current.onDeleteRequest(itemToDelete));
    expect(result.current.selectedNotification).not.toBeNull();
    await act(async () => {
      await result.current.confirmDelete();
    });
    expect(deleteNotification).toHaveBeenCalledWith(
      itemToDelete.notificationId
    );
    expect(list).toHaveBeenCalledTimes(4);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.items[0]?.content.push.title).toBe("残った通知0");
  });

  it("ページ取得に失敗したら前のページと表示を維持する", async () => {
    const list = vi
      .fn<AdminNotificationQueryApi["list"]>()
      .mockResolvedValueOnce(createResponseWithCount(51, "通知"))
      .mockRejectedValueOnce(new Error("取得失敗"));
    const queryApi = createQueryApi(list);
    const { result } = renderHook(() =>
      useNotificationList({ commandApi, queryApi })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.onPageChange(2));
    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());
    expect(result.current.currentPage).toBe(1);
    expect(result.current.items[0]?.content.push.title).toBe("通知0");
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
      expect(result.current.items[0]?.content.push.title).toBe("最新の通知")
    );

    await act(async () => {
      firstRequest.resolve(createResponse("古い通知"));
      await firstRequest.promise;
    });
    expect(result.current.items[0]?.content.push.title).toBe("最新の通知");
  });
  it.each([false, true])(
    "遅延GET中の削除後は新しい一覧・Calendarを取得する（Calendar: %s）",
    async (calendar) => {
      const old = createDeferred<AdminNotificationListResponse>();
      const list = vi
        .fn<AdminNotificationQueryApi["list"]>()
        .mockResolvedValueOnce(createResponse("削除前"))
        .mockReturnValueOnce(old.promise)
        .mockResolvedValue({
          items: [],
          pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 1 },
        });
      const queryApi = createQueryApi(list);
      const deleteApi = {
        ...commandApi,
        delete: vi.fn().mockResolvedValue(undefined),
      };
      const { result } = renderHook(() =>
        useNotificationList({ commandApi: deleteApi, queryApi })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      act(() => result.current.onDeleteRequest(result.current.items[0]));
      act(() => {
        if (calendar)
          void result.current.loadCalendar({
            from: "2026-11-01T00:00:00Z",
            to: "2026-12-01T00:00:00Z",
          });
        else void result.current.reload();
      });
      await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
      let deletion!: Promise<void>;
      act(() => {
        deletion = result.current.confirmDelete();
      });
      await waitFor(() => expect(deleteApi.delete).toHaveBeenCalledOnce());
      expect(list).toHaveBeenCalledTimes(2);
      await act(async () => {
        old.resolve(createResponse("古いGET"));
        await deletion;
      });
      expect(result.current.items).toEqual([]);
      if (calendar) expect(result.current.calendarItems).toEqual([]);
      expect(list).toHaveBeenCalledTimes(calendar ? 4 : 3);
    }
  );

  it.each([404, 409])(
    "削除%i後に一覧を再取得しエラーを維持する",
    async (status) => {
      const list = vi
        .fn()
        .mockResolvedValueOnce(createResponse("初回"))
        .mockResolvedValue(createResponse("最新"));
      const reportFeedback = vi.fn();
      const queryApi = createQueryApi(list);
      const { result } = renderHook(() =>
        useNotificationList({
          commandApi: {
            ...commandApi,
            delete: vi
              .fn()
              .mockRejectedValue(new ApiClientError(status, "削除不可")),
          },
          queryApi,
          reportFeedback,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      act(() => result.current.onDeleteRequest(result.current.items[0]));
      await act(() => result.current.confirmDelete());
      expect(list).toHaveBeenCalledTimes(2);
      expect(result.current.items[0].content.push.title).toBe("最新");
      expect(result.current.errorMessage).toBe("削除不可");
      expect(reportFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-error" })
      );
    }
  );
});
