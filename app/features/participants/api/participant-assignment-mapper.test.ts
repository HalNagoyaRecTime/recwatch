import { describe, expect, it } from "vitest";

import { toParticipantAssignments } from "./participant-assignment-mapper";

describe("toParticipantAssignments", () => {
  it("集合予定と学生・クラス・イベントを画面用の割り当てへ結合する", () => {
    const result = toParticipantAssignments({
      classrooms: [{ class_room_id: 1, class_name: "1年A組" }],
      students: [
        {
          user_id: 10,
          display_name: "山田 花子",
          class_room_id: 1,
        },
      ],
      events: [
        {
          event_id: 20,
          event_name: "リレー",
          start_time: "0910",
          end_time: "1010",
        },
      ],
      gatherings: [
        {
          gathering_id: 30,
          event_id: 20,
          gathering_spot_id: 1,
          gathering_time: "0850",
        },
      ],
      membersByGatheringId: new Map([[30, [{ user_id: 10 }]]]),
    });

    expect(result).toEqual([
      {
        gatheringId: 30,
        eventId: 20,
        eventName: "リレー",
        eventTime: "09:10〜10:10",
        classNames: ["1年A組"],
        memberNames: ["山田 花子"],
      },
    ]);
  });

  it("参照先が無いIDを推測せず未設定として扱う", () => {
    const result = toParticipantAssignments({
      classrooms: [],
      students: [],
      events: [],
      gatherings: [
        {
          gathering_id: 30,
          event_id: 999,
          gathering_spot_id: 1,
          gathering_time: "0850",
        },
      ],
      membersByGatheringId: new Map([[30, [{ user_id: 999 }]]]),
    });

    expect(result[0]).toMatchObject({
      eventName: "イベント未設定",
      classNames: [],
      memberNames: [],
    });
  });
});
