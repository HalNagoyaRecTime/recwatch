import { describe, expect, it } from "vitest";

import {
  canRemoveGathering,
  canRemoveRound,
  createEmptyRoundDraft,
  toRoundDrafts,
  type EventGatheringSettings,
} from "~/features/event-gatherings/model/event-gathering-settings";

const settings: EventGatheringSettings = {
  eventId: 12,
  rounds: [
    {
      round: 1,
      gatherings: [
        {
          id: 101,
          time: "10:45",
          spot: { id: 1, name: "出入口①" },
          memberUserIds: [1001, 1002],
          memberCount: 2,
        },
        {
          id: 102,
          time: "99:59",
          spot: { id: 2, name: "出入口②" },
          memberUserIds: [],
          memberCount: null,
        },
      ],
    },
  ],
};

describe("toRoundDrafts", () => {
  it("読み込んだ集合設定を編集用の下書きへ変換し、未設定の時刻は空にする", () => {
    const drafts = toRoundDrafts(settings);

    expect(drafts).toHaveLength(1);
    expect(drafts[0].round).toBe(1);
    expect(drafts[0].gatherings.map((g) => g.gatheringId)).toEqual([101, 102]);
    expect(drafts[0].gatherings[0].time).toBe("10:45");
    expect(drafts[0].gatherings[1].time).toBe("");
  });

  it("登録済みの参加者を選択状態と削除可否の判断に引き継ぐ", () => {
    const drafts = toRoundDrafts(settings);

    expect(drafts[0].gatherings[0].memberUserIds).toEqual([1001, 1002]);
    expect(drafts[0].gatherings[0].savedMemberCount).toBe(2);
    expect(drafts[0].gatherings[1].memberUserIds).toEqual([]);
    expect(drafts[0].gatherings[1].savedMemberCount).toBe(0);
  });

  it("行ごとに異なる key を割り当てる", () => {
    const drafts = toRoundDrafts(settings);
    const keys = drafts.flatMap((round) => [
      round.key,
      ...round.gatherings.map((g) => g.key),
    ]);

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("createEmptyRoundDraft", () => {
  it("既存の最大 Round 番号の次を使い、集合行を 1 つ持つ", () => {
    const existing = toRoundDrafts(settings);
    const created = createEmptyRoundDraft(existing);

    expect(created.round).toBe(2);
    expect(created.gatherings).toHaveLength(1);
    expect(created.gatherings[0].gatheringId).toBeNull();
    expect(created.gatherings[0].savedMemberCount).toBe(0);
  });

  it("Round が無ければ 1 から始める", () => {
    expect(createEmptyRoundDraft([]).round).toBe(1);
  });
});

describe("canRemoveGathering / canRemoveRound", () => {
  it("参加者が登録されている集合と、それを含む Round は削除できない", () => {
    const [round] = toRoundDrafts(settings);

    expect(canRemoveGathering(round.gatherings[0])).toBe(false);
    expect(canRemoveGathering(round.gatherings[1])).toBe(true);
    expect(canRemoveRound(round)).toBe(false);
  });

  it("参加者のいない集合だけの Round は削除できる", () => {
    const [round] = toRoundDrafts({
      eventId: 12,
      rounds: [
        {
          round: 1,
          gatherings: [settings.rounds[0].gatherings[1]],
        },
      ],
    });

    expect(canRemoveRound(round)).toBe(true);
  });
});
