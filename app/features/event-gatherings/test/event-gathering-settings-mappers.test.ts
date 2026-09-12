import { describe, expect, it } from "vitest";

import type { LegacyEventGatheringResponseDto } from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import {
  toEventGatheringSettings,
  toEventGatheringSettingsFromLegacyList,
  toEventGatheringSettingsWriteRequest,
} from "~/features/event-gatherings/api/mappers/event-gathering-settings-mappers";

function legacyItem(
  overrides: Partial<LegacyEventGatheringResponseDto>
): LegacyEventGatheringResponseDto {
  return {
    gathering_id: 1,
    event_id: 12,
    gathering_spot_id: 1,
    gathering_time: "10:45",
    round: 1,
    event_name: "リレー",
    gathering_spot_name: "出入口①",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

const noMembers = new Map();

describe("toEventGatheringSettingsFromLegacyList", () => {
  it("フラットな一覧を Round ごとにまとめ、round・時刻・ID の昇順にそろえる", () => {
    const settings = toEventGatheringSettingsFromLegacyList(
      12,
      [
        legacyItem({ gathering_id: 5, round: 2, gathering_time: "11:00" }),
        legacyItem({ gathering_id: 3, round: 1, gathering_time: "10:55" }),
        legacyItem({ gathering_id: 2, round: 1, gathering_time: "10:45" }),
        legacyItem({ gathering_id: 1, round: 1, gathering_time: "10:45" }),
      ],
      noMembers
    );

    expect(settings.eventId).toBe(12);
    expect(settings.rounds.map((round) => round.round)).toEqual([1, 2]);
    expect(
      settings.rounds[0].gatherings.map((gathering) => gathering.id)
    ).toEqual([1, 2, 3]);
    expect(settings.rounds[1].gatherings.map((g) => g.id)).toEqual([5]);
  });

  it("集合場所名と、集合ごとに読んだ参加者を含める", () => {
    const settings = toEventGatheringSettingsFromLegacyList(
      12,
      [
        legacyItem({ gathering_spot_id: 7, gathering_spot_name: "体育館" }),
        legacyItem({ gathering_id: 2, gathering_time: "10:55" }),
      ],
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
      spot: { id: 7, name: "体育館" },
      memberUserIds: [1001, 1002],
      memberCount: 2,
    });
    expect(settings.rounds[0].gatherings[1].memberUserIds).toEqual([]);
    expect(settings.rounds[0].gatherings[1].memberCount).toBe(0);
  });

  it("集合が無ければ rounds を空にする", () => {
    expect(toEventGatheringSettingsFromLegacyList(12, [], noMembers)).toEqual({
      eventId: 12,
      rounds: [],
    });
  });
});

describe("toEventGatheringSettings", () => {
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
