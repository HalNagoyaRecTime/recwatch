import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { useNotificationMonitor } from "~/features/notifications/hooks/useNotificationMonitor";
import {
  createMockNotificationMonitorApi,
  createNotificationMonitorFixtures,
} from "~/features/notifications/mock/notification-monitor-api";
import { ApiClientError } from "~/lib/api-client-error";

const now = () => Date.parse("2026-10-04T12:00:00+09:00");
const options = { now, refreshIntervalMs: 0 };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
afterEach(() => vi.restoreAllMocks());

describe("useNotificationMonitor", () => {
  it("期間外の進行中Scheduleも取得し、Recipient数とDelivery数を維持する", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    const sending = fixtures.find((item) => item.status === "sending")!;
    sending.sendAt = "2020-01-01T00:00:00Z";
    const api = createMockNotificationMonitorApi(fixtures);
    const list = vi.spyOn(api, "list");
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(list).toHaveBeenCalledWith();
    expect(result.current.items).toHaveLength(fixtures.length);
    const detail = result.current.items.find(
      (item) => item.detail?.status === "sending"
    )?.detail;
    expect(detail?.recipientProgress.count).toBe(40);
    expect(detail?.deliveryProgress.totalCount).toBe(42);
    expect(detail?.deliveryProgress.retryWaitCount).toBe(2);
  });

  it("表示対象外の詳細を取得しない", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    fixtures[0].sendAt = "2030-01-01T00:00:00Z";
    const api = createMockNotificationMonitorApi(fixtures);
    const getDetail = vi.spyOn(api, "getDetail");
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getDetail).not.toHaveBeenCalledWith(
      fixtures[0].notificationScheduleId
    );
  });

  it("詳細の新しいstatusで再配置し、Summaryの状態を推測しない", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const getDetail = api.getDetail;
    vi.spyOn(api, "getDetail").mockImplementation(async (id) => ({
      ...(await getDetail(id)),
      status: "sending",
    }));
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.items.every((item) => item.detail?.status === "sending")
    ).toBe(true);
  });

  it("一部の詳細が404でも他のカードを表示し、初期取得ではFeedbackを重複報告しない", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const getDetail = api.getDetail;
    vi.spyOn(api, "getDetail").mockImplementation((id) =>
      id === 501
        ? Promise.reject(
            new ApiClientError(
              404,
              "削除済み",
              "NOTIFICATION_SCHEDULE_NOT_FOUND"
            )
          )
        : getDetail(id)
    );
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, reportFeedback, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.items.find(
        (item) => item.summary.notificationScheduleId === 501
      )?.errorMessage
    ).toBeTruthy();
    expect(result.current.items.filter((item) => item.detail)).toHaveLength(6);
    expect(reportFeedback).not.toHaveBeenCalled();
    await act(() => result.current.reload());
    expect(reportFeedback).toHaveBeenCalledTimes(1);
    expect(reportFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "background-error" })
    );
  });

  it("一覧の初期エラーを画面に表示し、再読み込みで回復する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    vi.spyOn(api, "list").mockRejectedValueOnce(new Error("通信失敗"));
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
    expect(result.current.hasLoaded).toBe(false);
    await act(() => result.current.reload());
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.hasLoaded).toBe(true);
  });

  it("refresh失敗でも前回の表示と更新時刻を保持する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, reportFeedback, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const previous = result.current.items;
    vi.spyOn(api, "list").mockRejectedValueOnce(new Error("通信失敗"));
    await act(() => result.current.reload());
    expect(result.current.items).toBe(previous);
    expect(result.current.updatedAt).toBe(now());
    expect(reportFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "background-error" })
    );
  });

  it("詳細取得を最大4件に制限し、再読み込みを重ねない", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    const api = createMockNotificationMonitorApi(fixtures);
    const pending =
      deferred<
        Awaited<ReturnType<NotificationScheduleQueryApi["getDetail"]>>
      >();
    const list = vi.spyOn(api, "list");
    const getDetail = vi
      .spyOn(api, "getDetail")
      .mockReturnValue(pending.promise);
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(getDetail).toHaveBeenCalledTimes(4));
    await act(() => result.current.reload());
    expect(list).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve(fixtures[0]));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getDetail).toHaveBeenCalledTimes(fixtures.length);
  });

  it("API切替後に古いResponseを反映しない", async () => {
    const firstApi = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const secondApi = createMockNotificationMonitorApi([]);
    const pending =
      deferred<Awaited<ReturnType<NotificationScheduleQueryApi["list"]>>>();
    vi.spyOn(firstApi, "list").mockReturnValue(pending.promise);
    const { result, rerender } = renderHook(
      ({ api }) => useNotificationMonitor({ api, ...options }),
      { initialProps: { api: firstApi } }
    );
    await waitFor(() => expect(firstApi.list).toHaveBeenCalled());
    rerender({ api: secondApi });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () =>
      pending.resolve(await createMockNotificationMonitorApi().list())
    );
    expect(result.current.items).toEqual([]);
  });

  it("表示中だけ定期更新し、破棄時にtimerを解除する", async () => {
    const api = createMockNotificationMonitorApi([]);
    const list = vi.spyOn(api, "list");
    let tick!: () => void;
    vi.spyOn(window, "setInterval").mockImplementation((callback) => {
      tick = callback as () => void;
      return 123 as unknown as ReturnType<typeof window.setInterval>;
    });
    const clear = vi.spyOn(window, "clearInterval");
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const { result, unmount } = renderHook(() =>
      useNotificationMonitor({ api, now })
    );
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);
    await act(async () => tick());
    expect(list).toHaveBeenCalledTimes(2);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await act(async () => tick());
    expect(list).toHaveBeenCalledTimes(2);
    unmount();
    expect(clear).toHaveBeenCalledWith(123);
  });
});
