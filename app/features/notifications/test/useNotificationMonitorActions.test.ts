import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "~/lib/api-client-error";
import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import { createNotificationMonitorFixtures } from "~/features/notifications/mock/notification-monitor-api";
import {
  canRunMonitorAction,
  useNotificationMonitorActions,
  type MonitorAction,
} from "~/features/notifications/hooks/useNotificationMonitorActions";
const now = () => Date.parse("2026-10-19T12:00:00+09:00");
function setup(status: "sending" | "scheduled" = "sending") {
  const detail = createNotificationMonitorFixtures(now()).find(
    (item) => item.status === status
  )!;
  const item = { summary: detail, detail, errorMessage: null };
  const commandApi: NotificationScheduleCommandApi = {
    resend: vi.fn().mockResolvedValue({
      notificationId: detail.notificationId,
      notificationScheduleId: 999,
    }),
    cancel: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue({
      notificationScheduleId: detail.notificationScheduleId,
      status: "stopped",
    }),
  };
  const reload = vi.fn().mockResolvedValue(undefined);
  const reportFeedback = vi.fn();
  const props = { commandApi, reload, reportFeedback, now, items: [item] };
  const hook = renderHook((options) => useNotificationMonitorActions(options), {
    initialProps: props,
  });
  return { ...hook, props, item, detail, commandApi, reload, reportFeedback };
}
describe("配信モニター操作", () => {
  it.each(["resend", "stop", "cancel"] as MonitorAction[])(
    "%s成功後は再取得し、独自statusへ置き換えない",
    async (action) => {
      const test = setup(action === "cancel" ? "scheduled" : "sending");
      act(() => test.result.current.open(test.detail, action));
      await act(() => test.result.current.submit());
      expect(test.commandApi[action]).toHaveBeenCalledTimes(1);
      if (action === "resend")
        expect(test.commandApi.resend).toHaveBeenCalledWith(
          test.detail.notificationScheduleId,
          { delivery: { type: "immediate", sendAt: null } }
        );
      else
        expect(test.commandApi[action]).toHaveBeenCalledWith(
          test.detail.notificationScheduleId
        );
      expect(test.reload).toHaveBeenCalledTimes(1);
      expect(test.result.current.target).toBeNull();
      expect(test.detail.status).toBe(
        action === "cancel" ? "scheduled" : "sending"
      );
      expect(test.reportFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-success" })
      );
    }
  );
  it("予約再送の日時を検証し、入力を保持して再送する", async () => {
    const test = setup();
    act(() => test.result.current.open(test.detail, "resend"));
    act(() => {
      test.result.current.setTiming("scheduled");
      test.result.current.setSendAt("2020-01-01T12:00");
    });
    await act(() => test.result.current.submit());
    expect(test.commandApi.resend).not.toHaveBeenCalled();
    expect(test.result.current.error).toContain("未来");
    expect(test.reportFeedback).not.toHaveBeenCalled();
    act(() => test.result.current.setSendAt("2030-11-01T12:00"));
    await act(() => test.result.current.submit());
    expect(test.commandApi.resend).toHaveBeenCalledWith(
      test.detail.notificationScheduleId,
      {
        delivery: {
          type: "scheduled",
          sendAt: new Date("2030-11-01T12:00").toISOString(),
        },
      }
    );
  });
  it.each(["resend", "cancel", "stop"] as MonitorAction[])(
    "%sの409後に再取得し、dialogと入力を保つ",
    async (action) => {
      const test = setup(action === "cancel" ? "scheduled" : "sending");
      vi.mocked(test.commandApi[action]).mockRejectedValue(
        new ApiClientError(409, "競合しました")
      );
      act(() => test.result.current.open(test.detail, action));
      await act(() => test.result.current.submit());
      expect(test.reload).toHaveBeenCalledOnce();
      expect(test.result.current.target?.action).toBe(action);
      expect(test.result.current.error).toBe("競合しました");
      expect(test.reportFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-error" })
      );
      expect(test.reportFeedback).not.toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-success" })
      );
    }
  );
  it.each([404, 500, 0])("HTTP %s・通信失敗も再取得する", async (status) => {
    const test = setup();
    vi.mocked(test.commandApi.stop).mockRejectedValue(
      status ? new ApiClientError(status, "失敗") : new Error("通信失敗")
    );
    act(() => test.result.current.open(test.detail, "stop"));
    await act(() => test.result.current.submit());
    expect(test.reload).toHaveBeenCalledOnce();
    expect(test.result.current.isSubmitting).toBe(false);
    expect(test.result.current.error).toBeTruthy();
  });
  it("同じ描画内の連打と処理中の別操作・閉じるを防ぐ", async () => {
    const test = setup();
    let finish!: () => void;
    vi.mocked(test.commandApi.stop).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () =>
            resolve({
              notificationScheduleId: test.detail.notificationScheduleId,
              status: "stopped",
            });
        })
    );
    act(() => test.result.current.open(test.detail, "stop"));
    let first!: Promise<void>;
    act(() => {
      first = test.result.current.submit();
      void test.result.current.submit();
      test.result.current.close();
      test.result.current.open(test.detail, "resend");
    });
    expect(test.commandApi.stop).toHaveBeenCalledOnce();
    expect(test.result.current.target?.action).toBe("stop");
    await act(async () => {
      finish();
      await first;
    });
  });
  it("確認後に開始・削除されたScheduleは操作しない", async () => {
    const test = setup("scheduled");
    act(() => test.result.current.open(test.detail, "cancel"));
    test.rerender({
      ...test.props,
      items: [{ ...test.item, detail: { ...test.detail, status: "sending" } }],
    });
    await act(() => test.result.current.submit());
    expect(test.commandApi.cancel).not.toHaveBeenCalled();
    test.rerender({ ...test.props, items: [] });
    expect(test.result.current.canSubmit).toBe(false);
  });
  it("source削除済みautomaticの再送を拒否する", () => {
    const detail = setup().detail;
    expect(
      canRunMonitorAction(
        {
          ...detail,
          creation: {
            method: "automatic",
            user: null,
            source: { type: "gathering", id: 1, label: null },
          },
        },
        "resend"
      )
    ).toBe(false);
    expect(
      canRunMonitorAction({ ...detail, status: "resolving" }, "stop")
    ).toBe(false);
  });
});
