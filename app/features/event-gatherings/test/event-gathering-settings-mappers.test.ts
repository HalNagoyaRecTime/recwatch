import { describe, expect, it } from "vitest";

import {
  toEventGatheringSettings,
  toEventGatheringSettingsWriteRequest,
} from "~/features/event-gatherings/api/mappers/event-gathering-settings-mappers";

function gatheringResponse(gatheringId: number, time: string) {
  return {
    gathering_id: gatheringId,
    gathering_time: time,
    gathering_spot: { gathering_spot_id: 1, gathering_spot_name: "出入口①" },
    member_count: 0,
  };
}

describe("toEventGatheringSettings", () => {
  it("集合ごとに読んだ参加者を対応する集合へ含める", () => {
    const settings = toEventGatheringSettings(
      {
        event_id: 12,
        rounds: [
          {
            round: 1,
            gatherings: [
              { ...gatheringResponse(1, "10:45"), member_count: 2 },
              gatheringResponse(2, "10:55"),
            ],
          },
        ],
      },
      new Map([
        [
          1,
          [
            { gathering_group_member_id: 1, gathering_id: 1, user_id: 1001 },
            { gathering_group_member_id: 2, gathering_id: 1, user_id: 1002 },
          ],
        ],
      ])
    );

    expect(settings.rounds[0].gatherings[0]).toEqual({
      id: 1,
      time: "10:45",
      spot: { id: 1, name: "出入口①" },
      memberUserIds: [1001, 1002],
      memberCount: 2,
    });
    expect(settings.rounds[0].gatherings[1].memberUserIds).toEqual([]);
    expect(settings.rounds[0].gatherings[1].memberCount).toBe(0);
  });

  it("集合が無ければ rounds を空にする", () => {
    expect(toEventGatheringSettings({ event_id: 12, rounds: [] })).toEqual({
      eventId: 12,
      rounds: [],
    });
  });

  it("保存後レスポンスを参加人数付きで変換する", () => {
    const settings = toEventGatheringSettings({
      event_id: 12,
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
    });

    expect(settings).toEqual({
      eventId: 12,
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
  });
});

describe("toEventGatheringSettingsWriteRequest", () => {
  it("保存済みの行だけ gathering_id を付けて送る", () => {
    const request = toEventGatheringSettingsWriteRequest({
      rounds: [
        {
          round: 1,
          gatherings: [
            { gatheringId: 101, time: "10:45", spotId: 1 },
            { gatheringId: null, time: "10:55", spotId: 2 },
          ],
        },
      ],
    });

    expect(request).toEqual({
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              gathering_id: 101,
              gathering_time: "10:45",
              gathering_spot_id: 1,
            },
            { gathering_time: "10:55", gathering_spot_id: 2 },
          ],
        },
      ],
    });
    expect(request.rounds[0].gatherings[1]).not.toHaveProperty("gathering_id");
  });
});
