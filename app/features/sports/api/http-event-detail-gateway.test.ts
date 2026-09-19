import { describe, expect, it, vi } from "vitest";

import { createHttpEventDetailGateway } from "~/features/sports/api/http-event-detail-gateway";

describe("createHttpEventDetailGateway", () => {
  it("Event 詳細 1 回の GET で基本情報と Round ごとの集合に変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      event_id: 12,
      event_name: "リレー",
      rule_text: "バトンを使用します。",
      venue: "メインコート",
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
              member_count: 16,
            },
          ],
        },
      ],
      created_at: "",
      updated_at: "",
    });
    const gateway = createHttpEventDetailGateway({ get });

    await expect(gateway.load(12)).resolves.toEqual({
      id: 12,
      name: "リレー",
      venue: "メインコート",
      startTime: "11:00",
      endTime: "12:30",
      rules: "バトンを使用します。",
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberUserIds: [],
              memberCount: 16,
            },
          ],
        },
      ],
    });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/api/v1/events/12");
  });

  it("ルール未設定は null のまま、集合が無ければ rounds を空にする", async () => {
    const get = vi.fn().mockResolvedValue({
      event_id: 12,
      event_name: "リレー",
      rule_text: null,
      venue: "メインコート",
      start_time: "1100",
      end_time: "1230",
      rounds: [],
    });
    const gateway = createHttpEventDetailGateway({ get });

    const detail = await gateway.load(12);
    expect(detail.rules).toBeNull();
    expect(detail.rounds).toEqual([]);
  });
});
