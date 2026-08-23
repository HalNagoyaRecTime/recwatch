import { describe, expect, it, vi } from "vitest";

import { createHttpCompetitionAssignmentGateway } from "./http-competition-assignment-gateway";

function createClient() {
  return {
    get: vi.fn(async (path: string): Promise<unknown> => {
      const responses: Record<string, unknown> = {
        "/api/v1/classrooms?limit=100&offset=0": {
          classrooms: [{ class_room_id: 1, class_name: "1年A組" }],
          total: 2,
        },
        "/api/v1/classrooms?limit=100&offset=1": {
          classrooms: [{ class_room_id: 2, class_name: "1年B組" }],
          total: 2,
        },
        "/api/v1/students?limit=100&offset=0": {
          students: [
            {
              student_id: 2,
              user_id: 12,
              display_name: "山田 花子",
              class_room_id: 1,
              attendance_number: 3,
              student_id_number: "S001",
            },
          ],
          total: 1,
        },
        "/api/v1/events?limit=100&offset=0": {
          events: [
            {
              event_id: 4,
              event_name: "リレー",
              venue: "グラウンド",
              start_time: "0910",
            },
          ],
          total: 1,
        },
        "/api/v1/gathering-spots": [
          { gathering_spot_id: 5, gathering_spot_name: "正門前" },
        ],
        "/api/v1/gatherings": [
          {
            gathering_id: 6,
            event_id: 4,
            gathering_spot_id: 5,
            gathering_time: "08:50",
          },
        ],
        "/api/v1/gatherings/6/members": [{ user_id: 12 }],
      };
      return responses[path];
    }),
    post: vi.fn().mockResolvedValue({ gathering_id: 9 }),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe("createHttpCompetitionAssignmentGateway", () => {
  it("APIレスポンスを画面用モデルへ変換する", async () => {
    const client = createClient();
    const gateway = createHttpCompetitionAssignmentGateway(client);

    await expect(gateway.load()).resolves.toEqual({
      classrooms: [
        { id: 1, name: "1年A組" },
        { id: 2, name: "1年B組" },
      ],
      students: [
        {
          attendanceNumber: 3,
          classroomId: 1,
          id: 2,
          name: "山田 花子",
          studentNumber: "S001",
          userId: 12,
        },
      ],
      events: [
        { id: 4, name: "リレー", startTime: "09:10", venue: "グラウンド" },
      ],
      spots: [{ id: 5, name: "正門前" }],
      gatherings: [{ eventId: 4, id: 6, spotId: 5, time: "08:50" }],
    });
    await expect(gateway.loadMemberUserIds(6)).resolves.toEqual([12]);
  });

  it("新しい集合予定と選択メンバーをAPIへ登録する", async () => {
    const client = createClient();
    const gateway = createHttpCompetitionAssignmentGateway(client);

    await expect(
      gateway.save({
        eventId: 4,
        gatheringId: null,
        spotId: 5,
        time: "08:50",
        userIds: [12],
      })
    ).resolves.toEqual({
      gathering: { eventId: 4, id: 9, spotId: 5, time: "08:50" },
    });
    expect(client.post).toHaveBeenNthCalledWith(1, "/api/v1/gatherings", {
      eventId: 4,
      gatheringSpotId: 5,
      gatheringTime: "08:50",
      round: 1,
    });
    expect(client.post).toHaveBeenNthCalledWith(
      2,
      "/api/v1/gatherings/9/members",
      { userId: 12 }
    );
  });

  it("既存の集合予定ではメンバー差分だけを反映する", async () => {
    const client = createClient();
    const gateway = createHttpCompetitionAssignmentGateway(client);

    await gateway.save({
      eventId: 4,
      gatheringId: 6,
      spotId: 5,
      time: "08:50",
      userIds: [13],
    });

    expect(client.post).toHaveBeenCalledWith("/api/v1/gatherings/6/members", {
      userId: 13,
    });
    expect(client.delete).toHaveBeenCalledWith(
      "/api/v1/gatherings/6/members/12"
    );
  });
});
