import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { NotificationAudienceLoadingError } from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";
import { createHttpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";

describe("http notification audience loader", () => {
  it("classroomsとeventsを最後のページまで取得する", async () => {
    const firstClassrooms = Array.from({ length: 100 }, (_, index) => ({
      class_room_id: index + 1,
      class_code: `${index + 1}A`,
      class_name: `${index + 1}組`,
    }));
    const firstEvents = Array.from({ length: 100 }, (_, index) => ({
      event_id: index + 1,
      event_name: `競技${index + 1}`,
    }));
    const get = vi.fn(async (path: string) => {
      switch (path) {
        case "/api/v1/classrooms?limit=100&offset=0":
          return {
            classrooms: firstClassrooms,
            total: 101,
            limit: 100,
            offset: 0,
          };
        case "/api/v1/classrooms?limit=100&offset=100":
          return {
            classrooms: [
              { class_room_id: 101, class_code: "101A", class_name: "101組" },
            ],
            total: 101,
            limit: 100,
            offset: 100,
          };
        case "/api/v1/gatherings":
          return [];
        case "/api/v1/events?limit=100&offset=0":
          return {
            events: firstEvents,
            total: 101,
            limit: 100,
            offset: 0,
          };
        case "/api/v1/events?limit=100&offset=100":
          return {
            events: [{ event_id: 101, event_name: "競技101" }],
            total: 101,
            limit: 100,
            offset: 100,
          };
        default:
          throw new Error(`Unexpected path: ${path}`);
      }
    });

    const options = await createHttpNotificationAudienceApi({ get }).load();

    expect(options).toHaveLength(202);
    expect(options).toContainEqual({
      id: "101",
      name: "101A 101組",
      type: "class_room",
    });
    expect(options).toContainEqual({
      id: "101",
      name: "競技101",
      type: "event_participants",
    });
  });

  it.each([
    [401, "authentication_required"],
    [403, "forbidden"],
    [500, "unexpected"],
  ] as const)("HTTP %sを%sへ変換する", async (status, kind) => {
    const loader = createHttpNotificationAudienceApi({
      get: vi.fn().mockRejectedValue(new ApiClientError(status, "failed")),
    });

    await expect(loader.load()).rejects.toEqual(
      expect.objectContaining<Partial<NotificationAudienceLoadingError>>({
        kind,
      })
    );
  });

  it.each([
    ["classrooms", "/api/v1/classrooms", "/api/v1/events"],
    ["events", "/api/v1/events", "/api/v1/classrooms"],
  ] as const)(
    "%sのページネーションが上限に達した場合は読み込みを中止する",
    async (_, loopingPath, completedPath) => {
      const get = vi.fn(async (path: string) => {
        if (path.startsWith(loopingPath)) {
          const isClassroom = loopingPath.endsWith("classrooms");
          return isClassroom
            ? {
                classrooms: [
                  {
                    class_room_id: 1,
                    class_code: "1A",
                    class_name: "1組",
                  },
                ],
                total: 10_000,
                limit: 100,
                offset: 0,
              }
            : {
                events: [{ event_id: 1, event_name: "競技1" }],
                total: 10_000,
                limit: 100,
                offset: 0,
              };
        }
        if (path.startsWith(completedPath)) {
          return completedPath.endsWith("classrooms")
            ? { classrooms: [], total: 0, limit: 100, offset: 0 }
            : { events: [], total: 0, limit: 100, offset: 0 };
        }
        if (path === "/api/v1/gatherings") {
          return [];
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      await expect(
        createHttpNotificationAudienceApi({ get }).load()
      ).rejects.toEqual(
        expect.objectContaining<Partial<NotificationAudienceLoadingError>>({
          kind: "unexpected",
        })
      );

      expect(
        get.mock.calls.filter(([path]) => path.startsWith(loopingPath))
      ).toHaveLength(100);
    }
  );
});
