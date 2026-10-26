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
  it("後続ページも取得してから全対象者を検索する", async () => {
    const first = cloneFixture(notificationScheduleResultsFixture);
    first.recipients.pagination = {
      page: 1,
      limit: 100,
      totalPages: 2,
      totalCount: 3,
    };
    const second = cloneFixture(first);
    second.recipients.items = [
      {
        notificationRecipientId: 9999,
        user: { userId: 999, userName: "後続ページの対象者" },
        deliveries: [],
      },
    ];
    second.recipients.pagination.page = 2;
    const getResults = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
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
    expect(getResults).toHaveBeenCalledWith(504, { page: 2, limit: 100 });
    act(() =>
      result.current.onFiltersChange({
        search: "後続ページ",
        status: "all",
        platform: "all",
      })
    );
    expect(result.current.total).toBe(1);
    expect(result.current.items[0].user.userId).toBe(999);
  });
  it("選択前の遅いレスポンスを別の配信回へ反映しない", async () => {
    let resolveOld!: (value: NotificationScheduleResults) => void;
    const old = new Promise<NotificationScheduleResults>((resolve) => {
      resolveOld = resolve;
    });
    const next = cloneFixture(notificationScheduleResultsFixture);
    next.notificationScheduleId = 505;
    next.recipients.items[0].user.userName = "次の配信回";
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
    await act(async () => {
      resolveOld(cloneFixture(notificationScheduleResultsFixture));
      await old;
    });
    expect(result.current.data?.[0].user.userName).toBe("次の配信回");
  });
  it("後続ページの失敗を完全な取得結果として表示しない", async () => {
    const first = cloneFixture(notificationScheduleResultsFixture);
    first.recipients.pagination.totalPages = 2;
    const queryApi = api(
      vi
        .fn()
        .mockResolvedValueOnce(first)
        .mockRejectedValueOnce(new Error("取得失敗"))
    );
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
