import { describe, expect, it, vi } from "vitest";

import { createHttpEventQueryGateway } from "./http-event-query-gateway";

const gatheringSummary = {
  gathering_count: 2,
  configured_gathering_count: 1,
  first_gathering_time: "0845",
};

describe("createHttpEventQueryGateway", () => {
  it("イベントを最終ページまで取得し、集合概要を一覧項目へ変換する", async () => {
    const get = vi.fn(async (path: string): Promise<unknown> => {
      const responses: Record<string, unknown> = {
        "/api/v1/events?limit=100&offset=0": {
          events: [
            {
              event_id: 1,
              event_name: "リレー",
              rule_text: null,
              venues: [{ venue_id: 1, venue_name: "グラウンド" }],
              start_time: "0900",
              end_time: "1000",
              gathering_summary: gatheringSummary,
            },
          ],
          total: 2,
          limit: 100,
          offset: 0,
        },
        "/api/v1/events?limit=100&offset=1": {
          events: [
            {
              event_id: 2,
              event_name: "綱引き",
              rule_text: "ルール",
              venues: [{ venue_id: 2, venue_name: "体育館" }],
              start_time: "1030",
              end_time: "1100",
              gathering_summary: {
                gathering_count: 0,
                configured_gathering_count: 0,
                first_gathering_time: null,
              },
            },
          ],
          total: 2,
          limit: 100,
          offset: 1,
        },
      };
      return responses[path];
    });
    const gateway = createHttpEventQueryGateway({
      get,
    });

    const items = await gateway.list();

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: 1,
      venues: [{ id: 1, name: "グラウンド" }],
      startTime: "09:00",
      gatheringSummary: {
        gatheringCount: 2,
        configuredGatheringCount: 1,
        firstGatheringTime: "08:45",
      },
    });
    expect(items[1].gatheringSummary).toEqual({
      gatheringCount: 0,
      configuredGatheringCount: 0,
      firstGatheringTime: null,
    });
    expect(get).toHaveBeenCalledWith("/api/v1/events?limit=100&offset=1");
    expect(get).not.toHaveBeenCalledWith("/api/v1/gatherings");
  });

  it("不正なイベントを空値に変換せずエラーにする", async () => {
    const gateway = createHttpEventQueryGateway({
      get: vi.fn().mockResolvedValue({ events: [{ event_id: "1" }], total: 1 }),
    });

    await expect(gateway.list()).rejects.toThrow(
      "イベント一覧のレスポンス形式が正しくありません。"
    );
  });

  it("実施場所が欠けたイベントはエラーにする", async () => {
    const gateway = createHttpEventQueryGateway({
      get: vi.fn().mockResolvedValue({
        events: [
          {
            event_id: 1,
            event_name: "リレー",
            rule_text: null,
            start_time: "0900",
            end_time: "1000",
            gathering_summary: gatheringSummary,
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      }),
    });

    await expect(gateway.list()).rejects.toThrow(
      "イベント一覧のレスポンス形式が正しくありません。"
    );
  });

  it("集合概要が欠けたイベントはエラーにする", async () => {
    const gateway = createHttpEventQueryGateway({
      get: vi.fn().mockResolvedValue({
        events: [
          {
            event_id: 1,
            event_name: "リレー",
            rule_text: null,
            venues: [{ venue_id: 1, venue_name: "グラウンド" }],
            start_time: "0900",
            end_time: "1000",
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      }),
    });

    await expect(gateway.list()).rejects.toThrow(
      "イベント一覧のレスポンス形式が正しくありません。"
    );
  });

  it("詳細GETは共通Event responseからRoundと実施場所を変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      event_id: 12,
      event_name: "リレー",
      rule_text: "バトンを落とさない",
      venues: [{ venue_id: 3, venue_name: "メインコート" }],
      start_time: "1100",
      end_time: "1230",
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              gathering_id: 101,
              gathering_time: "10:45",
              gathering_spot: {
                gathering_spot_id: 1,
                gathering_spot_name: "出入口①",
              },
              member_count: 2,
            },
          ],
        },
      ],
    });
    const gateway = createHttpEventQueryGateway({ get });

    await expect(gateway.get(12)).resolves.toEqual({
      id: 12,
      name: "リレー",
      rules: "バトンを落とさない",
      venues: [{ id: 3, name: "メインコート" }],
      startTime: "11:00",
      endTime: "12:30",
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 2,
            },
          ],
        },
      ],
    });
    expect(get).toHaveBeenCalledWith("/api/v1/events/12");
  });

  it("詳細GETのRoundが欠けていればエラーにする", async () => {
    const gateway = createHttpEventQueryGateway({
      get: vi.fn().mockResolvedValue({
        event_id: 12,
        event_name: "リレー",
        rule_text: null,
        venues: [],
        start_time: "1100",
        end_time: "1230",
      }),
    });

    await expect(gateway.get(12)).rejects.toThrow(
      "イベント詳細のレスポンス形式が正しくありません。"
    );
  });
});
