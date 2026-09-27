import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
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
    const { result } = renderHook(() =>
      useNotificationCreate({
        api: createCommandApi(create),
        audienceApi,
        configApi,
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
  });
});
