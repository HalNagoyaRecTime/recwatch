import { describe, expect, it } from "vitest";

import type {
  GatheringDraft,
  RoundDraft,
} from "~/features/event-gatherings/model/event-gathering-settings";
import { validateEventGatheringSettings } from "~/features/event-gatherings/model/validate-event-gathering-settings";

function gathering(overrides: Partial<GatheringDraft> = {}): GatheringDraft {
  return {
    key: "g",
    gatheringId: null,
    time: "10:45",
    spotId: 1,
    memberUserIds: [],
    savedMemberCount: 0,
    ...overrides,
  };
}

function round(overrides: Partial<RoundDraft> = {}): RoundDraft {
  return { key: "r", round: 1, gatherings: [gathering()], ...overrides };
}

describe("validateEventGatheringSettings", () => {
  it("正しい下書きを保存 API の入力へ変換する", () => {
    const result = validateEventGatheringSettings([
      round({
        gatherings: [
          gathering({ key: "a", gatheringId: 101 }),
          gathering({ key: "b", time: "10:55", spotId: 2 }),
        ],
      }),
      round({ key: "r2", round: 2 }),
    ]);

    expect(result).toEqual({
      input: {
        rounds: [
          {
            round: 1,
            gatherings: [
              { gatheringId: 101, time: "10:45", spotId: 1 },
              { gatheringId: null, time: "10:55", spotId: 2 },
            ],
          },
          {
            round: 2,
            gatherings: [{ gatheringId: null, time: "10:45", spotId: 1 }],
          },
        ],
      },
    });
  });

  it("Round が 0 件でも保存できる", () => {
    expect(validateEventGatheringSettings([])).toEqual({
      input: { rounds: [] },
    });
  });

  it("Round 番号の範囲外と重複を Round 単位のエラーにする", () => {
    const result = validateEventGatheringSettings([
      round({ key: "r0", round: 0 }),
      round({ key: "r1", round: 1 }),
      round({ key: "r1-dup", round: 1 }),
      round({ key: "r100", round: 100 }),
    ]);

    expect(result).toEqual({
      errors: [
        {
          roundKey: "r0",
          message: "Round番号は1〜99の整数で入力してください。",
        },
        { roundKey: "r1-dup", message: "Round 1 が重複しています。" },
        {
          roundKey: "r100",
          message: "Round番号は1〜99の整数で入力してください。",
        },
      ],
    });
  });

  it("集合が無い Round を拒否する", () => {
    expect(validateEventGatheringSettings([round({ gatherings: [] })])).toEqual(
      {
        errors: [{ roundKey: "r", message: "集合を1件以上追加してください。" }],
      }
    );
  });

  it("時刻の未入力・不正と集合場所の未選択を行単位のエラーにする", () => {
    const result = validateEventGatheringSettings([
      round({
        gatherings: [
          gathering({ key: "empty", time: "" }),
          gathering({ key: "unset", time: "99:59" }),
          gathering({ key: "no-spot", spotId: null }),
        ],
      }),
    ]);

    expect(result).toEqual({
      errors: [
        {
          roundKey: "r",
          gatheringKey: "empty",
          message: "集合時間を入力してください。",
        },
        {
          roundKey: "r",
          gatheringKey: "unset",
          message: "集合時間を入力してください。",
        },
        {
          roundKey: "r",
          gatheringKey: "no-spot",
          message: "集合場所を選択してください。",
        },
      ],
    });
  });
});
