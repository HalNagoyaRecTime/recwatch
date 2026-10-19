import { describe, expect, it, vi } from "vitest";

import { createHttpCompetitionListGateway } from "./http-competition-list-gateway";

describe("createHttpCompetitionListGateway", () => {
  it("イベントを最終ページまで取得する", async () => {
    const get = vi.fn(async (path: string): Promise<unknown> => {
      const responses: Record<string, unknown> = {
        "/api/v1/events?limit=100&offset=0": {
          events: [
            {
              event_id: 1,
              event_name: "リレー",
              rule_text: null,
              venue: "グラウンド",
              start_time: "0900",
              end_time: "1000",
            },
          ],
          total: 2,
        },
        "/api/v1/events?limit=100&offset=1": {
          events: [
            {
              event_id: 2,
              event_name: "綱引き",
              rule_text: "ルール",
              venue: "体育館",
              start_time: "1030",
              end_time: "1100",
            },
          ],
          total: 2,
        },
        "/api/v1/gatherings": [],
      };
      return responses[path];
    });
    const gateway = createHttpCompetitionListGateway({
      delete: vi.fn(),
      get,
    });

    await expect(gateway.load()).resolves.toHaveLength(2);
    expect(get).toHaveBeenCalledWith("/api/v1/events?limit=100&offset=1");
  });

  it("不正なイベントを空値に変換せずエラーにする", async () => {
    const gateway = createHttpCompetitionListGateway({
      delete: vi.fn(),
      get: vi
        .fn()
        .mockImplementation(async (path: string) =>
          path === "/api/v1/gatherings"
            ? []
            : { events: [{ event_id: "1" }], total: 1 }
        ),
    });

    await expect(gateway.load()).rejects.toThrow(
      "イベント一覧のレスポンス形式が正しくありません。"
    );
  });
});
