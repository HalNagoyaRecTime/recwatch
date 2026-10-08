import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useNotificationRemoval } from "~/features/notifications/hooks/useNotificationRemoval";
import { canDeleteNotification } from "~/features/notifications/hooks/notification-list-data";
import {
  adminNotificationDetailFixture,
  cloneFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { ApiClientError } from "~/lib/api-client-error";

function setup() {
  const notification = cloneFixture(adminNotificationDetailFixture);
  notification.schedules = notification.schedules.map((s) => ({
    ...s,
    status: "scheduled",
  }));
  const options = {
    notification,
    commandApi: {
      create: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    scheduleCommandApi: {
      cancel: vi.fn().mockResolvedValue(undefined),
      resend: vi.fn(),
      stop: vi.fn(),
    },
    reload: vi.fn().mockResolvedValue(undefined),
    onDeleted: vi.fn(),
    reportFeedback: vi.fn(),
  };
  return options;
}
describe("通知削除・予約取消", () => {
  it("manual全件未開始のみ削除でき、Scheduleなしも削除できる", () => {
    const { notification } = setup();
    expect(canDeleteNotification(notification)).toBe(true);
    expect(canDeleteNotification({ ...notification, schedules: [] })).toBe(
      true
    );
    notification.schedules[0].status = "sending";
    expect(canDeleteNotification(notification)).toBe(false);
    notification.schedules = [];
    notification.creation = {
      method: "automatic",
      user: null,
      source: { type: "gathering", id: 1, label: null },
    };
    expect(canDeleteNotification(notification)).toBe(false);
  });
  it("削除成功で一覧へ戻り既存Feedbackを報告する", async () => {
    const options = setup();
    const { result } = renderHook(() => useNotificationRemoval(options));
    act(() => result.current.request({ type: "notification" }));
    await act(() => result.current.confirm());
    expect(options.commandApi.delete).toHaveBeenCalledWith(
      options.notification.notificationId
    );
    expect(options.onDeleted).toHaveBeenCalledTimes(1);
    expect(options.reportFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "action-success" })
    );
  });
  it("予約取消成功後にGETを再取得し二重cancelを防ぐ", async () => {
    const options = setup();
    let done!: () => void;
    options.scheduleCommandApi.cancel.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          done = resolve;
        })
    );
    const { result } = renderHook(() => useNotificationRemoval(options));
    const id = options.notification.schedules[0].notificationScheduleId;
    act(() => result.current.request({ type: "schedule", id }));
    await act(async () => {
      const first = result.current.confirm();
      const second = result.current.confirm();
      expect(options.scheduleCommandApi.cancel).toHaveBeenCalledTimes(1);
      done();
      await Promise.all([first, second]);
    });
    expect(options.reload).toHaveBeenCalledTimes(1);
    expect(result.current.target).toBeNull();
    expect(options.onDeleted).not.toHaveBeenCalled();
  });
  it.each([404, 409, 500])(
    "%iのcancel失敗でも再取得し成功扱いにしない",
    async (status) => {
      const options = setup();
      options.scheduleCommandApi.cancel.mockRejectedValue(
        new ApiClientError(status, "取消不可")
      );
      const { result } = renderHook(() => useNotificationRemoval(options));
      act(() =>
        result.current.request({
          type: "schedule",
          id: options.notification.schedules[0].notificationScheduleId,
        })
      );
      await act(() => result.current.confirm());
      expect(options.reload).toHaveBeenCalledTimes(1);
      expect(result.current.errorMessage).toBe("取消不可");
      expect(options.reportFeedback).toHaveBeenCalledTimes(1);
      expect(options.reportFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-error" })
      );
    }
  );
  it("確認後に開始したScheduleはcancelを送信しない", async () => {
    const options = setup();
    const { result, rerender } = renderHook(() =>
      useNotificationRemoval(options)
    );
    act(() =>
      result.current.request({
        type: "schedule",
        id: options.notification.schedules[0].notificationScheduleId,
      })
    );
    options.notification.schedules[0].status = "sending";
    rerender();
    await act(() => result.current.confirm());
    expect(options.scheduleCommandApi.cancel).not.toHaveBeenCalled();
  });
});
