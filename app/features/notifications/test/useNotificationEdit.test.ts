import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import { useNotificationEdit } from "~/features/notifications/hooks/useNotificationEdit";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import { adminNotificationDetailFixture } from "~/features/notifications/mock/notification-fixtures";
import type { AdminNotificationDetail } from "~/features/notifications/api/contracts/admin-notification-command-api";
import { ApiClientError } from "~/lib/api-client-error";
import { mockNotificationConfigApi } from "~/features/notifications/mock/notification-config-api";

function createNotification(
  notificationId: number,
  title: string
): AdminNotificationDetail {
  return {
    ...adminNotificationDetailFixture,
    notificationId,
    content: {
      push: { ...adminNotificationDetailFixture.content.push, title },
      detail: { ...adminNotificationDetailFixture.content.detail, title },
    },
  };
}

function createQueryApi(
  getDetail: AdminNotificationQueryApi["getDetail"]
): AdminNotificationQueryApi {
  return { list: vi.fn(), getDetail };
}

const commandApi: AdminNotificationCommandApi = {
  create: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe("useNotificationEdit", () => {
  it("通知本体とAudienceを初回取得し、ID変更時にdraftを切り替える", async () => {
    const getDetail = vi
      .fn<AdminNotificationQueryApi["getDetail"]>()
      .mockResolvedValueOnce(createNotification(1, "1件目"))
      .mockResolvedValueOnce(createNotification(2, "2件目"));
    const load = vi.fn().mockResolvedValue(mockNotificationAudienceOptions);
    const queryApi = createQueryApi(getDetail);
    const audienceApi: NotificationAudienceApi = { load };
    const { result, rerender } = renderHook(
      ({ notificationId }) =>
        useNotificationEdit({
          audienceApi,
          commandApi,
          configApi: mockNotificationConfigApi,
          queryApi,
          notificationId,
        }),
      { initialProps: { notificationId: 1 } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() =>
      expect(result.current.audienceOptions).toEqual(
        mockNotificationAudienceOptions
      )
    );
    expect(result.current.notification?.notificationId).toBe(1);
    expect(result.current.draft.title).toBe("1件目");

    rerender({ notificationId: 2 });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.notification).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notification?.notificationId).toBe(2);
    expect(result.current.draft.title).toBe("2件目");
    expect(getDetail).toHaveBeenNthCalledWith(1, 1);
    expect(getDetail).toHaveBeenNthCalledWith(2, 2);
  });

  it("通知本体の取得失敗をloadErrorへ反映する", async () => {
    const queryApi = createQueryApi(
      vi
        .fn<AdminNotificationQueryApi["getDetail"]>()
        .mockRejectedValue(
          new ApiClientError(404, "通知が見つかりません。", "NOT_FOUND")
        )
    );
    const audienceApi = {
      load: vi.fn().mockResolvedValue(mockNotificationAudienceOptions),
    };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 99,
      })
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe("通知が見つかりません。");
    expect(result.current.notification).toBeNull();
  });

  it("不正IDはAPIを呼ばずエラー状態を返す", () => {
    const getDetail = vi.fn<AdminNotificationQueryApi["getDetail"]>();
    const queryApi = createQueryApi(getDetail);
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 0,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadError).toBe("通知IDが不正です。");
    expect(result.current.notification).toBeNull();
    expect(getDetail).not.toHaveBeenCalled();
  });

  it("Audience取得失敗を表示し、reloadで再試行する", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(401, "Audience取得失敗", "UNAUTHORIZED")
      )
      .mockResolvedValueOnce(mockNotificationAudienceOptions);
    const queryApi = createQueryApi(
      vi.fn().mockResolvedValue(createNotification(1, "通知"))
    );
    const audienceApi = { load };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi,
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 1,
      })
    );

    await waitFor(() =>
      expect(result.current.audienceError).toBe("Audience取得失敗")
    );

    act(() => result.current.onAudienceReload());

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.audienceOptions).toEqual(
        mockNotificationAudienceOptions
      )
    );
    expect(result.current.audienceError).toBeNull();
  });
  it("編集でも重複対象はAPIとFeedbackへ送らない", async () => {
    const notification = createNotification(1, "通知");
    notification.schedules = notification.schedules.map((schedule) => ({
      ...schedule,
      status: "scheduled",
      sendAt: "2030-11-07T12:00:00Z",
    }));
    const patch = vi.fn();
    const reportFeedback = vi.fn();
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const queryApi = createQueryApi(vi.fn().mockResolvedValue(notification));
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        queryApi,
        commandApi: { ...commandApi, patch },
        configApi: mockNotificationConfigApi,
        notificationId: 1,
        reportFeedback,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.onChange({
        ...result.current.draft,
        audiences: [
          { key: "a", type: "user", targetId: "1" },
          { key: "b", type: "user", targetId: "1" },
        ],
      })
    );
    await act(() => result.current.submit());
    expect(result.current.errors["audiences.1"]).toBe(
      "同じ通知対象が重複しています"
    );
    expect(patch).not.toHaveBeenCalled();
    expect(reportFeedback).not.toHaveBeenCalled();
  });

  it("409で最新状態を取得し、入力した詳細を保って詳細のみ再保存する", async () => {
    const initial = createNotification(1, "通知");
    initial.schedules = initial.schedules.map((schedule) => ({
      ...schedule,
      status: "scheduled",
      sendAt: "2030-11-07T12:00:00Z",
    }));
    const started = {
      ...initial,
      schedules: initial.schedules.map((schedule) => ({
        ...schedule,
        status: "sending" as const,
      })),
    };
    const getDetail = vi
      .fn()
      .mockResolvedValueOnce(initial)
      .mockResolvedValue(started);
    const queryApi = createQueryApi(getDetail);
    const patch = vi
      .fn()
      .mockRejectedValueOnce(new ApiClientError(409, "開始済みです"))
      .mockResolvedValue(started);
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi: { ...commandApi, patch },
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 1,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.onChange({
        ...result.current.draft,
        title: "保存されないPush",
        body: "保存されない本文",
        importance: "high",
        audiences: [{ key: "new", type: "user", targetId: "123" }],
        detailTitle: "入力した詳細",
        detailBody: "入力した本文",
      })
    );
    await act(() => result.current.submit());
    expect(getDetail).toHaveBeenCalledTimes(2);
    expect(result.current.canEditAudience).toBe(false);
    expect(result.current.draft.title).toBe(started.content.push.title);
    expect(result.current.draft.body).toBe(started.content.push.body);
    expect(result.current.draft.importance).toBe(started.importance);
    expect(result.current.draft.audiences[0].type).toBe(
      started.schedules[0].audience.items[0].type
    );
    expect(result.current.draft.detailTitle).toBe("入力した詳細");
    expect(result.current.submissionError).toBe("開始済みです");
    await act(() => result.current.submit());
    expect(patch).toHaveBeenLastCalledWith(1, {
      content: { detail: { title: "入力した詳細", body: "入力した本文" } },
    });
  });

  it("409後の再取得失敗でも入力を保持し、次の保存で回復する", async () => {
    const notification = createNotification(1, "通知");
    notification.schedules = notification.schedules.map((schedule) => ({
      ...schedule,
      status: "sending",
      sendAt: "2020-01-01T12:00:00Z",
    }));
    const getDetail = vi
      .fn()
      .mockResolvedValueOnce(notification)
      .mockRejectedValueOnce(new Error("通信失敗"))
      .mockResolvedValue(notification);
    const queryApi = createQueryApi(getDetail);
    const patch = vi.fn().mockRejectedValue(new ApiClientError(409, "競合"));
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi: { ...commandApi, patch },
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 1,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.onChange({
        ...result.current.draft,
        detailTitle: "維持する入力",
      })
    );
    await act(() => result.current.submit());
    expect(result.current.draft.detailTitle).toBe("維持する入力");
    expect(result.current.isSubmitting).toBe(false);
    await act(() => result.current.submit());
    expect(getDetail).toHaveBeenCalledTimes(3);
    expect(result.current.draft.detailTitle).toBe("維持する入力");
  });

  it("配信開始後は過去の配信日時を検証せず詳細だけ保存する", async () => {
    const notification = createNotification(1, "通知");
    notification.schedules = notification.schedules.map((schedule) => ({
      ...schedule,
      status: "sending",
      sendAt: "2020-01-01T00:00:00Z",
    }));
    const patch = vi.fn().mockResolvedValue(notification);
    const audienceApi = { load: vi.fn().mockResolvedValue([]) };
    const queryApi = createQueryApi(vi.fn().mockResolvedValue(notification));
    const { result } = renderHook(() =>
      useNotificationEdit({
        audienceApi,
        commandApi: { ...commandApi, patch },
        configApi: mockNotificationConfigApi,
        queryApi,
        notificationId: 1,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.onChange({
        ...result.current.draft,
        detailTitle: "更新詳細",
      })
    );
    await act(async () => expect(await result.current.submit()).toBe(true));
    expect(patch).toHaveBeenCalledWith(1, {
      content: {
        detail: { title: "更新詳細", body: notification.content.detail.body },
      },
    });
  });

  it.each([400, 409, 500])(
    "%iエラーでdraftを保持し、validationはFeedbackへ保存しない",
    async (status) => {
      const notification = createNotification(1, "通知");
      notification.schedules = notification.schedules.map((schedule) => ({
        ...schedule,
        status: "sending",
      }));
      const error = new ApiClientError(
        status,
        "保存失敗",
        status === 400 ? "VALIDATION_ERROR" : "CONFLICT",
        status === 400
          ? {
              fieldErrors: {
                content: ["詳細を確認してください"],
                schedule: ["配信日時を確認してください"],
                importance: ["重要度を確認してください"],
              },
              formErrors: [],
            }
          : undefined
      );
      const patch = vi.fn().mockRejectedValue(error);
      const reportFeedback = vi.fn();
      const audienceApi = { load: vi.fn().mockResolvedValue([]) };
      const queryApi = createQueryApi(vi.fn().mockResolvedValue(notification));
      const { result } = renderHook(() =>
        useNotificationEdit({
          audienceApi,
          commandApi: { ...commandApi, patch },
          configApi: mockNotificationConfigApi,
          queryApi,
          notificationId: 1,
          reportFeedback,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      act(() =>
        result.current.onChange({
          ...result.current.draft,
          detailTitle: "保持する入力",
        })
      );
      await act(async () => expect(await result.current.submit()).toBe(false));
      expect(result.current.draft.detailTitle).toBe("保持する入力");
      if (status === 400) {
        expect(result.current.submissionError).toContain(
          "通知内容: 詳細を確認してください"
        );
        expect(result.current.submissionError).toContain(
          "通知対象・配信日時: 配信日時を確認してください"
        );
        expect(result.current.errors.importance).toBe(
          "重要度を確認してください"
        );
        expect(reportFeedback).not.toHaveBeenCalled();
      } else {
        expect(reportFeedback).toHaveBeenCalledWith(
          expect.objectContaining({ kind: "action-error" })
        );
      }
    }
  );
});
