import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { ClientError, ClientErrors } from "~/lib/client-error";
import { createHttpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";

const gatheringResponse = {
  gathering_id: 1,
  gathering_time: "0850",
  gathering_spot: {
    gathering_spot_id: 1,
    gathering_spot_name: "体育館前",
  },
  member_count: 0,
};

describe("http notification audience loader", () => {
  it("全ページのclassroomsとeventsを取得し、各競技の全roundsから集合を読み込む", async () => {
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
        case "/api/v1/students?limit=100&offset=0&isStaff=all&isLiveActive=true":
        case "/api/v1/teachers?limit=100&offset=0&isStaff=all&isLiveActive=true":
          return { items: [], total: 0, limit: 100, offset: 0 };
        case "/api/v1/classrooms?limit=100&offset=0":
          return {
            items: firstClassrooms,
            total: 101,
            limit: 100,
            offset: 0,
          };
        case "/api/v1/classrooms?limit=100&offset=100":
          return {
            items: [
              { class_room_id: 101, class_code: "101A", class_name: "101組" },
            ],
            total: 101,
            limit: 100,
            offset: 100,
          };
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
        default: {
          const match = path.match(/^\/api\/v1\/events\/(\d+)$/);
          if (match) {
            const eventId = Number(match[1]);
            const rounds = eventId === 1 ? [1, 2] : eventId === 101 ? [1] : [];
            return {
              rounds: rounds.map((round) => ({
                round,
                gatherings: [
                  {
                    ...gatheringResponse,
                    gathering_id: eventId * 100 + round,
                  },
                ],
              })),
            };
          }
          throw new Error(`Unexpected path: ${path}`);
        }
      }
    });

    const options = await createHttpNotificationAudienceApi({ get }).load();

    expect(options).toHaveLength(205);
    expect(options).toContainEqual({
      id: "101",
      name: "101A 101組",
      type: "class_room",
    });
    expect(options).toContainEqual({
      id: "101",
      name: "競技101",
      type: "event",
    });
    expect(options.filter((option) => option.type === "gathering")).toEqual([
      { id: "101", name: "競技1 / 体育館前 (08:50)", type: "gathering" },
      { id: "102", name: "競技1 / 体育館前 (08:50)", type: "gathering" },
      { id: "10101", name: "競技101 / 体育館前 (08:50)", type: "gathering" },
    ]);
    expect(
      get.mock.calls.filter(([path]) => /^\/api\/v1\/events\/\d+$/.test(path))
    ).toHaveLength(101);
    expect(get).not.toHaveBeenCalledWith("/api/v1/gatherings");
  });

  it("学生・教員を全ページ取得し、学生IDではなくuser_idで重複なく返す", async () => {
    const get = vi.fn(async (path: string) => {
      const query = new URL(path, "http://localhost");
      const offset = Number(query.searchParams.get("offset"));
      if (query.pathname === "/api/v1/students")
        return {
          items: [
            {
              student_id: offset + 1,
              user_id: offset + 901,
              display_name: `学生${offset + 1}`,
            },
          ],
          total: 2,
          limit: 100,
          offset,
        };
      if (query.pathname === "/api/v1/teachers")
        return {
          items: [
            { teacher_id: 1, user_id: 903, display_name: "教員1" },
            { user_id: 901, display_name: "学生1" },
          ],
          total: 2,
          limit: 100,
          offset,
        };
      return query.pathname === "/api/v1/events"
        ? { events: [], total: 0, limit: 100, offset: 0 }
        : { items: [], total: 0, limit: 100, offset: 0 };
    });
    const options = await createHttpNotificationAudienceApi({ get }).load();
    expect(options).toEqual([
      { id: "901", name: "学生1", type: "user" },
      { id: "902", name: "学生2", type: "user" },
      { id: "903", name: "教員1", type: "user" },
    ]);
    expect(get).toHaveBeenCalledWith(
      "/api/v1/students?limit=100&offset=1&isStaff=all&isLiveActive=true"
    );
  });

  it.each([0, "901", undefined])(
    "不正なuser_id %sを拒否する",
    async (userId) => {
      const get = vi.fn(async (path: string) =>
        path.startsWith("/api/v1/events?")
          ? { events: [], total: 0, limit: 100, offset: 0 }
          : {
              items: path.startsWith("/api/v1/students?")
                ? [{ user_id: userId, display_name: "学生" }]
                : [],
              total: 1,
              limit: 100,
              offset: 0,
            }
      );
      await expect(
        createHttpNotificationAudienceApi({ get }).load()
      ).rejects.toEqual(new ClientError(ClientErrors.RESPONSE_PARSE_ERROR));
    }
  );

  it.each([
    ["本文がnull", null],
    ["roundsが欠落", {}],
    ["roundsが配列ではない", { rounds: {} }],
    ["roundがnull", { rounds: [null] }],
    ["round番号が不正", { rounds: [{ round: 0, gatherings: [] }] }],
    ["gatheringsが欠落", { rounds: [{ round: 1 }] }],
    ["gatheringsが配列ではない", { rounds: [{ round: 1, gatherings: {} }] }],
    ...(
      [
        ["集合がnull", null],
        ["集合IDが不正", { ...gatheringResponse, gathering_id: "1" }],
        ["集合時刻が不正", { ...gatheringResponse, gathering_time: "" }],
        ["集合場所がnull", { ...gatheringResponse, gathering_spot: null }],
        [
          "集合場所IDが不正",
          {
            ...gatheringResponse,
            gathering_spot: {
              gathering_spot_id: 0,
              gathering_spot_name: "体育館前",
            },
          },
        ],
        [
          "集合場所名が不正",
          {
            ...gatheringResponse,
            gathering_spot: { gathering_spot_id: 1, gathering_spot_name: "" },
          },
        ],
        ["人数が不正", { ...gatheringResponse, member_count: -1 }],
      ] as const
    ).map(
      ([label, gathering]) =>
        [label, { rounds: [{ round: 1, gatherings: [gathering] }] }] as const
    ),
  ] as const)(
    "Event詳細の%sはレスポンス解析エラーになる",
    async (_, detail) => {
      const get = createSingleEventGet(() => detail);
      const result = createHttpNotificationAudienceApi({ get }).load();

      await expect(result).rejects.toBeInstanceOf(ClientError);
      await expect(result).rejects.toEqual(
        new ClientError(ClientErrors.RESPONSE_PARSE_ERROR)
      );
      expect(get).toHaveBeenCalledWith("/api/v1/events/1");
    }
  );

  it.each([{ rounds: [] }, { rounds: [{ round: 1, gatherings: [] }] }])(
    "集合が空の場合も競技を通知対象として返す: %j",
    async (detail) => {
      const get = createSingleEventGet(() => detail);

      await expect(
        createHttpNotificationAudienceApi({ get }).load()
      ).resolves.toEqual([{ id: "1", name: "競技1", type: "event" }]);
    }
  );

  it("競技がない場合はEvent詳細を取得しない", async () => {
    const get = vi.fn(async (path: string) => {
      if (
        path.startsWith("/api/v1/students?") ||
        path.startsWith("/api/v1/teachers?")
      )
        return { items: [], total: 0, limit: 100, offset: 0 };
      if (path === "/api/v1/classrooms?limit=100&offset=0") {
        return { items: [], total: 0, limit: 100, offset: 0 };
      }
      if (path === "/api/v1/events?limit=100&offset=0") {
        return { events: [], total: 0, limit: 100, offset: 0 };
      }
      throw new Error(`想定外の取得先: ${path}`);
    });

    await expect(
      createHttpNotificationAudienceApi({ get }).load()
    ).resolves.toEqual([]);
    expect(get).toHaveBeenCalledTimes(4);
  });

  it.each([401, 403, 404, 500])(
    "Event詳細のHTTP %sエラーをそのまま伝播する",
    async (status) => {
      const error = new ApiClientError(status, "取得失敗");
      const get = createSingleEventGet(() => {
        throw error;
      });

      await expect(
        createHttpNotificationAudienceApi({ get }).load()
      ).rejects.toBe(error);
    }
  );

  it.each([
    [401, "authentication_required"],
    [403, "forbidden"],
    [500, "unexpected"],
  ] as const)("HTTP %sのApiClientErrorをそのまま伝播する", async (...args) => {
    const [status] = args;
    const loader = createHttpNotificationAudienceApi({
      get: vi.fn().mockRejectedValue(new ApiClientError(status, "failed")),
    });

    await expect(loader.load()).rejects.toEqual(
      new ApiClientError(status, "failed")
    );
  });

  it.each([
    ["classrooms", "/api/v1/classrooms", "/api/v1/events"],
    ["events", "/api/v1/events", "/api/v1/classrooms"],
  ] as const)(
    "%sのページネーションが上限に達した場合は読み込みを中止する",
    async (_, loopingPath, completedPath) => {
      const get = vi.fn(async (path: string) => {
        if (
          path.startsWith("/api/v1/students?") ||
          path.startsWith("/api/v1/teachers?")
        )
          return { items: [], total: 0, limit: 100, offset: 0 };
        if (path.startsWith(loopingPath)) {
          const isClassroom = loopingPath.endsWith("classrooms");
          return isClassroom
            ? {
                items: [
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
            ? { items: [], total: 0, limit: 100, offset: 0 }
            : { events: [], total: 0, limit: 100, offset: 0 };
        }
        throw new Error(`Unexpected path: ${path}`);
      });

      await expect(
        createHttpNotificationAudienceApi({ get }).load()
      ).rejects.toEqual(new ClientError(ClientErrors.RESPONSE_PARSE_ERROR));

      expect(
        get.mock.calls.filter(([path]) => path.startsWith(loopingPath))
      ).toHaveLength(100);
    }
  );
});

function createSingleEventGet(loadDetail: () => unknown) {
  return vi.fn(async (path: string) => {
    switch (path) {
      case "/api/v1/students?limit=100&offset=0&isStaff=all&isLiveActive=true":
      case "/api/v1/teachers?limit=100&offset=0&isStaff=all&isLiveActive=true":
        return { items: [], total: 0, limit: 100, offset: 0 };
      case "/api/v1/classrooms?limit=100&offset=0":
        return { items: [], total: 0, limit: 100, offset: 0 };
      case "/api/v1/events?limit=100&offset=0":
        return {
          events: [{ event_id: 1, event_name: "競技1" }],
          total: 1,
          limit: 100,
          offset: 0,
        };
      case "/api/v1/events/1":
        return loadDetail();
      default:
        throw new Error(`想定外の取得先: ${path}`);
    }
  });
}
