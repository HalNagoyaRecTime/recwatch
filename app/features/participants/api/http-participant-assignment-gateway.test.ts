import { describe, expect, it, vi } from "vitest";

import { createHttpParticipantAssignmentGateway } from "./http-participant-assignment-gateway";

describe("createHttpParticipantAssignmentGateway", () => {
  it("主要一覧と各集合のメンバーを取得して割り当てを返す", async () => {
    const get = vi.fn(async (path: string): Promise<unknown> => {
      const responses: Record<string, unknown> = {
        "/api/v1/classrooms?limit=100&offset=0": {
          classrooms: [{ class_room_id: 1, class_name: "1年A組" }],
          total: 1,
        },
        "/api/v1/students?limit=100&offset=0": {
          students: [
            { user_id: 10, display_name: "山田 花子", class_room_id: 1 },
          ],
          total: 1,
        },
        "/api/v1/events?limit=100&offset=0": {
          events: [
            {
              event_id: 20,
              event_name: "リレー",
              start_time: "0910",
              end_time: "1010",
            },
          ],
          total: 2,
        },
        "/api/v1/events?limit=100&offset=1": {
          events: [
            {
              event_id: 21,
              event_name: "綱引き",
              start_time: "1030",
              end_time: "1100",
            },
          ],
          total: 2,
        },
        "/api/v1/gatherings": [
          {
            gathering_id: 30,
            event_id: 20,
            gathering_spot_id: 1,
            gathering_time: "0850",
          },
        ],
        "/api/v1/gatherings/30/members": [{ user_id: 10 }],
      };
      return responses[path];
    });

    const gateway = createHttpParticipantAssignmentGateway({
      delete: vi.fn(),
      get,
    });

    await expect(gateway.load()).resolves.toEqual([
      expect.objectContaining({
        gatheringId: 30,
        eventName: "リレー",
        memberNames: ["山田 花子"],
      }),
    ]);
    expect(get).toHaveBeenCalledWith("/api/v1/gatherings/30/members");
    expect(get).toHaveBeenCalledWith("/api/v1/events?limit=100&offset=1");
  });

  it("不正なAPIレスポンスを空表示にせずエラーとして扱う", async () => {
    const get = vi.fn().mockResolvedValue({ invalid: true });
    const gateway = createHttpParticipantAssignmentGateway({
      delete: vi.fn(),
      get,
    });

    await expect(gateway.load()).rejects.toThrow(
      "出場メンバーのデータ形式が不正です。"
    );
  });

  it("集合予定を削除する", async () => {
    const deleteRequest = vi.fn().mockResolvedValue(undefined);
    const gateway = createHttpParticipantAssignmentGateway({
      delete: deleteRequest,
      get: vi.fn(),
    });

    await gateway.delete(30);

    expect(deleteRequest).toHaveBeenCalledWith("/api/v1/gatherings/30");
  });
});
