import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { useNotificationMonitor } from "~/features/notifications/hooks/useNotificationMonitor";
import {
  createMockNotificationMonitorApi,
  createNotificationMonitorFixtures,
} from "~/features/notifications/mock/notification-monitor-api";

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
  it("更新のたびに一覧を1回だけ呼び、日付をまたぐ配信の進み具合を一覧から表示する", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    fixtures[0].sendAt = new Date(now() + 23 * 60 * 60 * 1000).toISOString();
    const sending = fixtures.find((item) => item.status === "sending")!;
    sending.sendAt = new Date(now() - 23 * 60 * 60 * 1000).toISOString();
    const api = createMockNotificationMonitorApi(fixtures);
    const list = vi.spyOn(api, "list");
    const getDetail = vi.spyOn(api, "getDetail");
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(list).toHaveBeenCalledWith({
      from: new Date(now() - 86_400_000).toISOString(),
      to: new Date(now() + 86_400_000).toISOString(),
    });
    expect(result.current.items).toHaveLength(fixtures.length);
    const schedule = result.current.items.find(
      (item) => item.status === "sending"
    );
    expect(schedule?.recipientProgress?.count).toBe(40);
    expect(schedule?.deliveryProgress?.totalCount).toBe(42);
    expect(schedule?.deliveryProgress?.retryWaitCount).toBe(2);
    await act(() => result.current.reload());
    await act(() => result.current.reload());
    expect(list).toHaveBeenCalledTimes(3);
    expect(getDetail).not.toHaveBeenCalled();
  });

  it("一覧で進み具合がnullの配信のうち、頼まれたものだけ詳細を1回取り、更新後も取り直さない", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    const completed = fixtures.find((item) => item.status === "completed")!;
    const failed = fixtures.find((item) => item.status === "failed")!;
    const sending = fixtures.find((item) => item.status === "sending")!;
    const api = createMockNotificationMonitorApi(fixtures);
    const getDetail = vi.spyOn(api, "getDetail");
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const progressOf = (id: number) =>
      result.current.items.find((item) => item.notificationScheduleId === id)
        ?.deliveryProgress;
    expect(progressOf(completed.notificationScheduleId)).toBeNull();

    await act(() =>
      result.current.loadDetails([
        completed.notificationScheduleId,
        sending.notificationScheduleId,
      ])
    );
    await act(() => result.current.reload());
    await act(() =>
      result.current.loadDetails([completed.notificationScheduleId])
    );

    expect(getDetail).toHaveBeenCalledOnce();
    expect(getDetail).toHaveBeenCalledWith(completed.notificationScheduleId);
    expect(progressOf(completed.notificationScheduleId)).toEqual(
      completed.deliveryProgress
    );
    expect(progressOf(failed.notificationScheduleId)).toBeNull();
  });

  it("詳細の取得に失敗したら1回だけ報告し、次の一覧更新までは取り直さない", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    const completed = fixtures.find((item) => item.status === "completed")!;
    const api = createMockNotificationMonitorApi(fixtures);
    const getDetail = vi
      .spyOn(api, "getDetail")
      .mockRejectedValueOnce(new Error("通信失敗"));
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, reportFeedback, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const ids = [completed.notificationScheduleId];

    await act(() => result.current.loadDetails(ids));
    await act(() => result.current.loadDetails(ids));
    expect(getDetail).toHaveBeenCalledOnce();
    expect(reportFeedback).toHaveBeenCalledOnce();
    await act(() => result.current.reload());
    await act(() => result.current.loadDetails(ids));

    expect(getDetail).toHaveBeenCalledTimes(2);
    expect(reportFeedback).toHaveBeenCalledOnce();
    expect(
      result.current.items.find(
        (item) =>
          item.notificationScheduleId === completed.notificationScheduleId
      )?.deliveryProgress
    ).toEqual(completed.deliveryProgress);
  });

  it("mutation後の再取得を進行中の古い取得より優先する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const oldRequest = deferred<Awaited<ReturnType<typeof api.list>>>();
    const list = vi.spyOn(api, "list").mockReturnValueOnce(oldRequest.promise);
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(list).toHaveBeenCalledOnce());
    let refresh!: Promise<void>;
    act(() => {
      refresh = result.current.reloadAfterMutation();
    });
    expect(list).toHaveBeenCalledOnce();
    await act(async () => {
      oldRequest.resolve({ items: [] });
      await refresh;
    });
    expect(list).toHaveBeenCalledTimes(2);
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it("表示対象外の配信を出さない", async () => {
    const fixtures = createNotificationMonitorFixtures(now());
    fixtures[0].sendAt = "2030-01-01T00:00:00Z";
    const api = createMockNotificationMonitorApi(fixtures);
    vi.spyOn(api, "list").mockResolvedValue({ items: fixtures });
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.items.map((item) => item.notificationScheduleId)
    ).not.toContain(fixtures[0].notificationScheduleId);
    expect(result.current.items).toHaveLength(fixtures.length - 1);
  });

  it("一覧の初期エラーはFeedbackへ報告せず画面に表示し、再読み込みで回復する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    vi.spyOn(api, "list").mockRejectedValueOnce(new Error("通信失敗"));
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, reportFeedback, ...options })
    );
    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
    expect(result.current.hasLoaded).toBe(false);
    expect(reportFeedback).not.toHaveBeenCalled();
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

  it("取得中の再読み込みを重ねない", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const pending =
      deferred<Awaited<ReturnType<NotificationScheduleQueryApi["list"]>>>();
    const list = vi.spyOn(api, "list").mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, ...options })
    );
    await waitFor(() => expect(list).toHaveBeenCalledOnce());
    await act(() => result.current.reload());
    expect(list).toHaveBeenCalledOnce();
    await act(async () => pending.resolve({ items: [] }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
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
  it("一覧の連続失敗を1回だけ報告し、回復後に再報告する", async () => {
    const api = createMockNotificationMonitorApi(
      createNotificationMonitorFixtures(now())
    );
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationMonitor({ api, reportFeedback, ...options })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const spy = vi.spyOn(api, "list");
    spy.mockRejectedValue(new Error("通信失敗"));
    await act(() => result.current.reload());
    await act(() => result.current.reload());
    await act(() => result.current.reload());
    expect(reportFeedback).toHaveBeenCalledTimes(1);
    spy.mockRestore();
    await act(() => result.current.reload());
    expect(reportFeedback).toHaveBeenCalledTimes(1);
    vi.spyOn(api, "list").mockRejectedValue(new Error("再度失敗"));
    await act(() => result.current.reload());
    expect(reportFeedback).toHaveBeenCalledTimes(2);
  });
});
