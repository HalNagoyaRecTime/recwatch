import { describe, expect, it } from "vitest";

import { ClientError, ClientErrors } from "~/lib/client-error";
import {
  toClassRoomAudiencePage,
  toEventAudiencePage,
  toGatheringAudienceDtos,
  toNotificationAudienceOptions,
  toUserAudiencePage,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";

describe("notification audience response mapper", () => {
  it("外部DTOを通知対象の内部モデルへ変換する", () => {
    const classrooms = toClassRoomAudiencePage({
      items: [
        {
          class_room_id: 1,
          class_code: "1A",
          class_name: "1年A組",
          student_count: 30,
          teacher: null,
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    }).items;
    const gatherings = toGatheringAudienceDtos([
      {
        gathering_id: 2,
        event_id: 3,
        round: 2,
        gathering_spot_id: 4,
        gathering_time: "0850",
        event_name: "大縄跳び",
        gathering_spot_name: "体育館前",
      },
    ]);
    const events = toEventAudiencePage({
      events: [
        {
          event_id: 3,
          event_name: "大縄跳び",
          venue: "体育館",
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    }).events;

    expect(
      toNotificationAudienceOptions({ classrooms, gatherings, events })
    ).toEqual([
      { id: "1", name: "1A 1年A組", type: "class_room" },
      {
        id: "2",
        name: "大縄跳び / ラウンド2 / 体育館前 (08:50)",
        type: "gathering",
      },
      { id: "3", name: "大縄跳び", type: "event" },
    ]);
  });

  it("不正なレスポンスをunexpectedエラーへ変換する", () => {
    expect(() =>
      toClassRoomAudiencePage({
        items: [{ class_room_id: "1" }],
        total: 1,
        limit: 100,
        offset: 0,
      })
    ).toThrowError(new ClientError(ClientErrors.RESPONSE_PARSE_ERROR));

    expect(() =>
      toClassRoomAudiencePage({
        classrooms: [],
        total: 0,
        limit: 100,
        offset: 0,
      })
    ).toThrowError(new ClientError(ClientErrors.RESPONSE_PARSE_ERROR));
  });

  it("totalの無い学生・教員のページを受け付ける", () => {
    expect(
      toUserAudiencePage({
        items: [{ user_id: 1, display_name: "学生1" }],
        limit: 100,
        offset: 0,
      })
    ).toEqual({ items: [{ user_id: 1, display_name: "学生1" }] });
  });

  it.each([
    ["本文がnull", null],
    ["itemsが欠落", { limit: 100, offset: 0 }],
    ["itemsが配列ではない", { items: {}, limit: 100, offset: 0 }],
    ["要素がnull", { items: [null], limit: 100, offset: 0 }],
    [
      "要素の表示名が空",
      { items: [{ user_id: 1, display_name: "" }], limit: 100, offset: 0 },
    ],
  ])("学生・教員のページの%sはunexpectedエラーにする", (_, response) => {
    expect(() => toUserAudiencePage(response)).toThrowError(
      new ClientError(ClientErrors.RESPONSE_PARSE_ERROR)
    );
  });
});
