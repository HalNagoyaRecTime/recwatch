import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  NotificationScheduleQueryApi,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { useNotificationResults } from "~/features/notifications/hooks/useNotificationResults";
import {
  notificationScheduleResultsFixture,
  cloneFixture,
} from "~/features/notifications/mock/notification-fixtures";

function api(
  getResults: NotificationScheduleQueryApi["getResults"]
): NotificationScheduleQueryApi {
  return { list: vi.fn(), getDetail: vi.fn(), getResults };
}
describe("配信結果の取得と検索", () => {
  it("検索と送信結果の変更を API に渡して1ページ目から取得する", async () => {
    const getResults = vi
      .fn()
      .mockResolvedValue(cloneFixture(notificationScheduleResultsFixture));
    const queryApi = api(getResults);
    const { result } = renderHook(() =>
      useNotificationResults({
        api: queryApi,
        scheduleId: 504,
        active: true,
        refreshKey: 0,
      })
    );
    await waitFor(() => expect(result.current.data).not.toBeNull());
    act(() =>
      result.current.onFiltersChange({
        search: "山田",
        status: "failed",
        platform: "all",
      })
    );
    await waitFor(() =>
      expect(getResults).toHaveBeenLastCalledWith(504, {
        page: 1,
        limit: 50,
        includeRegisteredAt: "1",
        search: "山田",
        status: "failed",
      })
    );
  });
  it("検索語の入力が止まるまで取得を待ち、連続入力でも1回だけ問い合わせる", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const getResults = vi
        .fn()
        .mockResolvedValue(cloneFixture(notificationScheduleResultsFixture));
      const queryApi = api(getResults);
      const { result } = renderHook(() =>
        useNotificationResults({
          api: queryApi,
          scheduleId: 504,
          active: true,
          refreshKey: 0,
        })
      );
      await act(async () => {});
      expect(getResults).toHaveBeenCalledTimes(1);
      for (const search of ["山", "山田", "山田太"]) {
        act(() =>
          result.current.onFiltersChange({
            search,
            status: "all",
            platform: "all",
          })
        );
        await act(async () => {
          await vi.advanceTimersByTimeAsync(100);
        });
      }
      expect(getResults).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      expect(getResults).toHaveBeenCalledTimes(2);
      expect(getResults).toHaveBeenLastCalledWith(504, {
        page: 1,
        limit: 50,
        includeRegisteredAt: "1",
        search: "山田太",
      });
    } finally {
      vi.useRealTimers();
    }
  });
  it("サーバーサイドページネーションで1ページ分だけ取得する", async () => {
    const first = cloneFixture(notificationScheduleResultsFixture);
    first.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalCount: first.recipients.items.length,
    };
    const getResults = vi.fn().mockResolvedValueOnce(first);
    const queryApi = api(getResults);
    const { result } = renderHook(() =>
      useNotificationResults({
        api: queryApi,
        scheduleId: 504,
        active: true,
        refreshKey: 0,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getResults).toHaveBeenCalledWith(504, {
      page: 1,
      limit: 50,
      includeRegisteredAt: "1",
    });
    expect(result.current.total).toBe(first.recipients.items.length);
  });
  it("選択前の遅いレスポンスを別の配信回へ反映しない", async () => {
    let resolveOld!: (value: NotificationScheduleResults) => void;
    const old = new Promise<NotificationScheduleResults>((resolve) => {
      resolveOld = resolve;
    });
    const next = cloneFixture(notificationScheduleResultsFixture);
    next.notificationScheduleId = 505;
    next.recipients.items[0].user.userName = "次の配信回";
    next.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalCount: next.recipients.items.length,
    };
    const getResults = vi
      .fn()
      .mockReturnValueOnce(old)
      .mockResolvedValueOnce(next);
    const queryApi = api(getResults);
    const { result, rerender } = renderHook(
      ({ scheduleId }) =>
        useNotificationResults({
          api: queryApi,
          scheduleId,
          active: true,
          refreshKey: 0,
        }),
      { initialProps: { scheduleId: 504 } }
    );
    await waitFor(() => expect(getResults).toHaveBeenCalledTimes(1));
    rerender({ scheduleId: 505 });
    await waitFor(() =>
      expect(result.current.data?.[0].user.userName).toBe("次の配信回")
    );
    const oldResult = cloneFixture(notificationScheduleResultsFixture);
    oldResult.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalCount: oldResult.recipients.items.length,
    };
    await act(async () => {
      resolveOld(oldResult);
      await old;
    });
    expect(result.current.data?.[0].user.userName).toBe("次の配信回");
  });
  it("件数が減って表示中のページが範囲外になったら最終ページを取り直す", async () => {
    const first = cloneFixture(notificationScheduleResultsFixture);
    first.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 2,
      totalCount: 60,
    };
    const emptyPage = cloneFixture(notificationScheduleResultsFixture);
    emptyPage.recipients.items = [];
    emptyPage.recipients.pagination = {
      page: 2,
      limit: 50,
      totalPages: 1,
      totalCount: 1,
    };
    const lastPage = cloneFixture(notificationScheduleResultsFixture);
    lastPage.recipients.items[0].user.userName = "最後のページ";
    lastPage.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalCount: 1,
    };
    const getResults = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(emptyPage)
      .mockResolvedValueOnce(lastPage);
    const queryApi = api(getResults);
    const { result } = renderHook(() =>
      useNotificationResults({
        api: queryApi,
        scheduleId: 504,
        active: true,
        refreshKey: 0,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.onPageChange(2));
    await waitFor(() =>
      expect(result.current.data?.[0].user.userName).toBe("最後のページ")
    );
    expect(getResults).toHaveBeenNthCalledWith(3, 504, {
      page: 1,
      limit: 50,
      includeRegisteredAt: "1",
    });
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(1);
  });
  it("絞り込み後の取得が失敗したら前の条件の一覧を残さない", async () => {
    const first = cloneFixture(notificationScheduleResultsFixture);
    first.recipients.items[0].user.userName = "前の条件";
    first.recipients.pagination = {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalCount: first.recipients.items.length,
    };
    const getResults = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(new Error("取得失敗"));
    const queryApi = api(getResults);
    const { result } = renderHook(() =>
      useNotificationResults({
        api: queryApi,
        scheduleId: 504,
        active: true,
        refreshKey: 0,
      })
    );
    await waitFor(() =>
      expect(result.current.data?.[0].user.userName).toBe("前の条件")
    );
    act(() =>
      result.current.onFiltersChange({
        search: "山田",
        status: "all",
        platform: "all",
      })
    );
    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
    expect(result.current.data).toBeNull();
    expect(result.current.total).toBe(0);
  });
  it("取得失敗時にエラーメッセージを表示する", async () => {
    const queryApi = api(vi.fn().mockRejectedValueOnce(new Error("取得失敗")));
    const { result } = renderHook(() =>
      useNotificationResults({
        api: queryApi,
        scheduleId: 504,
        active: true,
        refreshKey: 0,
      })
    );
    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
