import { loadAllPages } from "~/lib/load-all-pages";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import type {
  ClassroomPageResponseDto,
  GatheringMemberResponseDto,
  StudentPageResponseDto,
} from "~/features/event-gatherings/api/dto/gathering-member-api-dto";
import {
  toMemberClassroom,
  toMemberStudent,
  toMemberUserIds,
  toReplaceGatheringMembersRequest,
} from "~/features/event-gatherings/api/mappers/gathering-member-mappers";

type GatheringMemberHttpClient = {
  get<T>(path: string): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

export function createHttpGatheringMemberGateway(
  client: GatheringMemberHttpClient
): GatheringMemberGateway {
  return {
    async loadCandidates() {
      const [classrooms, students] = await Promise.all([
        loadAllPages(async (offset, limit) => {
          const page = await client.get<ClassroomPageResponseDto>(
            `/api/v1/classrooms?limit=${limit}&offset=${offset}`
          );
          return {
            items: page.items.map(toMemberClassroom),
            total: page.total,
          };
        }),
        loadAllPages(async (offset, limit) => {
          const page = await client.get<StudentPageResponseDto>(
            `/api/v1/students?limit=${limit}&offset=${offset}`
          );
          return {
            items: page.items.map(toMemberStudent),
            total: page.total,
          };
        }),
      ]);

      return { classrooms, students };
    },

    async loadMembers(gatheringId) {
      const response = await client.get<GatheringMemberResponseDto[]>(
        `/api/v1/gatherings/${gatheringId}/members`
      );
      return toMemberUserIds(response);
    },

    // 参加者は 1 人ずつ追加・削除せず、選択内容全体を 1 回の PUT で置き換える。
    async saveMembers(gatheringId, userIds) {
      const response = await client.put<GatheringMemberResponseDto[]>(
        `/api/v1/gatherings/${gatheringId}/members`,
        toReplaceGatheringMembersRequest(userIds)
      );
      return toMemberUserIds(response);
    },
  };
}
