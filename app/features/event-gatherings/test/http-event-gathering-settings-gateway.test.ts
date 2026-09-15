import { describe, expect, it, vi } from "vitest";

import { createHttpEventGatheringSettingsGateway } from "~/features/event-gatherings/api/http/http-event-gathering-settings-gateway";
import { createHttpGatheringMemberGateway } from "~/features/event-gatherings/api/http/http-gathering-member-gateway";

type Client = {
  get<T>(path: string): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

function createClient(overrides: Partial<Record<keyof Client, unknown>> = {}) {
  return { get: vi.fn(), put: vi.fn(), ...overrides } as Client;
}

describe("createHttpEventGatheringSettingsGateway", () => {
  it("旧形式の集合予定一覧と集合ごとの参加者を読み、Event 単位の集合設定にする", async () => {
    const get = vi.fn().mockImplementation(async (path: string) => {
      if (path === "/api/v1/events/12/gatherings") {
        return [
          {
            gathering_id: 101,
            event_id: 12,
            gathering_spot_id: 1,
            gathering_time: "10:45",
            round: 1,
            event_name: "リレー",
            gathering_spot_name: "出入口①",
            created_at: "",
            updated_at: "",
          },
        ];
      }
      if (path === "/api/v1/gatherings/101/members") {
        return [
          { gathering_group_member_id: 1, gathering_id: 101, user_id: 1001 },
        ];
      }
      throw new Error(`unexpected path: ${path}`);
    });
    const gateway = createHttpEventGatheringSettingsGateway(
      createClient({ get })
    );

    await expect(gateway.load(12)).resolves.toEqual({
      eventId: 12,
      rounds: [
        {
          round: 1,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberUserIds: [1001],
              memberCount: 1,
            },
          ],
        },
      ],
    });
    expect(get).toHaveBeenCalledWith("/api/v1/events/12/gatherings");
    expect(get).toHaveBeenCalledWith("/api/v1/gatherings/101/members");
  });

  it("保存 API へ snake_case で送り、保存後の状態を返す", async () => {
    const put = vi.fn().mockResolvedValue({
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
    const gateway = createHttpEventGatheringSettingsGateway(
      createClient({ put })
    );

    const saved = await gateway.save(12, {
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

    expect(put).toHaveBeenCalledWith("/api/v1/events/12/gatherings", {
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
    expect(saved.rounds[0].gatherings[0].memberCount).toBe(16);
  });
});

describe("createHttpGatheringMemberGateway", () => {
  it("クラスと学生を全ページ読み込む", async () => {
    const get = vi.fn().mockImplementation(async (path: string) => {
      if (path.startsWith("/api/v1/classrooms")) {
        return {
          items: [{ class_room_id: 1, class_name: "HAL1A" }],
          total: 1,
        };
      }
      if (path.startsWith("/api/v1/students")) {
        return {
          items: [
            {
              student_id: 10,
              user_id: 1001,
              display_name: "山田 太郎",
              attendance_number: 1,
              student_id_number: "2026001",
              class_room: { class_room_id: 1, class_name: "HAL1A" },
            },
          ],
          total: 1,
        };
      }
      throw new Error(`unexpected path: ${path}`);
    });
    const gateway = createHttpGatheringMemberGateway(createClient({ get }));

    await expect(gateway.loadCandidates()).resolves.toEqual({
      classrooms: [{ id: 1, name: "HAL1A" }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
        },
      ],
    });
    expect(get).toHaveBeenCalledWith("/api/v1/classrooms?limit=100&offset=0");
    expect(get).toHaveBeenCalledWith("/api/v1/students?limit=100&offset=0");
  });

  it("参加者の保存はまだ API を呼ばず、未対応として失敗する", async () => {
    const get = vi.fn();
    const gateway = createHttpGatheringMemberGateway(createClient({ get }));

    await expect(gateway.saveMembers(101, [1001])).rejects.toThrow(
      "参加者の保存は現在未対応です。"
    );
    expect(get).not.toHaveBeenCalled();
  });
});
