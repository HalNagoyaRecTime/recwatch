import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { ApiClientError } from "~/lib/api-client-error";
import { useNotificationCreate } from "~/features/notifications/hooks/useNotificationCreate";
import { mockNotificationAudienceOptions } from "~/features/notifications/mock/notification-audience-api";
import { notificationApiErrorFixtures } from "~/features/notifications/mock/notification-fixtures";

const audienceApi = {
  load: vi.fn().mockResolvedValue(mockNotificationAudienceOptions),
};

function createCommandApi(
  create: AdminNotificationCommandApi["create"] = vi.fn().mockResolvedValue({
    notificationId: 1,
    notificationScheduleId: 2,
  })
): AdminNotificationCommandApi {
  return {
    create,
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

function createConfigApi(
  getAudienceCount: NotificationConfigApi["getAudienceCount"] = vi
    .fn()
    .mockResolvedValue({ recipientCount: 42 })
): NotificationConfigApi {
  return {
    getConfig: vi.fn().mockResolvedValue({
      importance: { default: "normal", options: ["normal", "high"] },
    }),
    getAudienceCount,
  };
}

describe("useNotificationCreate", () => {
  it("configとAudience候補人数を取得する", async () => {
    const getAudienceCount = vi.fn().mockResolvedValue({ recipientCount: 42 });
    const configApi = createConfigApi(getAudienceCount);
    const { result } = renderHook(() =>
      useNotificationCreate({
        api: createCommandApi(),
        audienceApi,
        configApi,
      })
    );

    await waitFor(() =>
      expect(result.current.importanceOptions).toEqual(["normal", "high"])
    );
    await waitFor(() => expect(result.current.recipientCount).toBe(42));
    expect(getAudienceCount).toHaveBeenCalledWith({
      audience: { items: [{ type: "all" }] },
    });
  });

  it("複数Audienceをv2 Requestで送信する", async () => {
    const create = vi.fn().mockResolvedValue({
      notificationId: 1,
      notificationScheduleId: 2,
    });
    const configApi = createConfigApi();
    const { result } = renderHook(() =>
      useNotificationCreate({
        api: createCommandApi(create),
        audienceApi,
        configApi,
      })
    );

    act(() =>
      result.current.onChange({
        title: "Push",
        body: "Push body",
        detailTitle: "Detail",
        detailBody: "Detail body",
        importance: "high",
        audiences: [
          { key: "a", type: "class_room", targetId: "1" },
          { key: "b", type: "event", targetId: "2" },
        ],
        deliveryTiming: "now",
        scheduledAt: "",
      })
    );
    await act(() => result.current.submit());

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        audience: {
          items: [
            { type: "class_room", targetId: 1 },
            { type: "event", targetId: 2 },
          ],
        },
        importance: "high",
      })
    );
  });

  it("400 fieldErrorsを表示し、入力Draftを保持する", async () => {
    const create = vi
      .fn()
      .mockRejectedValue(notificationApiErrorFixtures.VALIDATION_ERROR());
    const configApi = createConfigApi();
    const reportFeedback = vi.fn();
    const { result } = renderHook(() =>
      useNotificationCreate({
        api: createCommandApi(create),
        audienceApi,
        configApi,
        reportFeedback,
      })
    );
    const draft = {
      title: "保持するタイトル",
      body: "本文",
      detailTitle: "詳細",
      detailBody: "詳細本文",
      importance: "normal" as const,
      audiences: [{ key: "a", type: "all" as const, targetId: "" }],
      deliveryTiming: "now" as const,
      scheduledAt: "",
    };

    act(() => result.current.onChange(draft));
    await act(() => result.current.submit());

    expect(result.current.draft).toEqual(draft);
    expect(result.current.errors.title).toBe("入力してください。");
    expect(reportFeedback).not.toHaveBeenCalled();
  });
  it.each([403, 409, 500])(
    "%iの作成失敗で入力を保持しaction-errorを通知する",
    async (status) => {
      const create = vi
        .fn()
        .mockRejectedValue(new ApiClientError(status, "登録失敗"));
      const reportFeedback = vi.fn();
      const configApi = createConfigApi();
      const { result } = renderHook(() =>
        useNotificationCreate({
          api: createCommandApi(create),
          audienceApi,
          configApi,
          reportFeedback,
        })
      );
      await waitFor(() =>
        expect(result.current.importanceOptions.length).toBeGreaterThan(0)
      );
      const draft = {
        ...result.current.draft,
        title: "保持タイトル",
        body: "本文",
        detailTitle: "詳細",
        detailBody: "詳細本文",
      };
      act(() => result.current.onChange(draft));
      await act(async () => {
        expect(await result.current.submit()).toBeNull();
      });
      expect(result.current.draft).toEqual(draft);
      expect(reportFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "action-error" })
      );
    }
  );

  it("同じ描画中の連続submitでも作成APIを1回だけ呼ぶ", async () => {
    let finish!: (value: {
      notificationId: number;
      notificationScheduleId: number;
    }) => void;
    const create = vi.fn(
      () =>
        new Promise<{ notificationId: number; notificationScheduleId: number }>(
          (resolve) => {
            finish = resolve;
          }
        )
    );
    const configApi = createConfigApi();
    const { result } = renderHook(() =>
      useNotificationCreate({
        api: createCommandApi(create),
        audienceApi,
        configApi,
      })
    );
    await waitFor(() =>
      expect(result.current.importanceOptions.length).toBeGreaterThan(0)
    );
    act(() =>
      result.current.onChange({
        ...result.current.draft,
        title: "タイトル",
        body: "本文",
        detailTitle: "詳細",
        detailBody: "詳細本文",
      })
    );
    await act(async () => {
      const first = result.current.submit();
      const second = result.current.submit();
      expect(create).toHaveBeenCalledTimes(1);
      finish({ notificationId: 1, notificationScheduleId: 1 });
      await Promise.all([first, second]);
    });
  });
});
