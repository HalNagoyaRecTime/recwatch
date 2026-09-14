import { loadAllPages } from "~/lib/load-all-pages";
import { ClientError, type ClientErrorDefinition } from "~/lib/client-error";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import type {
  ClassroomPageResponseDto,
  StudentPageResponseDto,
} from "~/features/event-gatherings/api/dto/gathering-member-api-dto";
import {
  toMemberClassroom,
  toMemberStudent,
} from "~/features/event-gatherings/api/mappers/gathering-member-mappers";

type GatheringMemberHttpClient = {
  get<T>(path: string): Promise<T>;
};

const MEMBER_SAVE_UNSUPPORTED: ClientErrorDefinition = {
  code: "GATHERING_MEMBER_SAVE_UNSUPPORTED",
  message: "参加者の保存は現在未対応です。",
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

    // 参加者の保存は送信方法・形式が未確定のため、まだ API を呼ばない。
    // 呼び出し元は保存を試みず、画面上で未対応であることを案内する。
    async saveMembers() {
      throw new ClientError(MEMBER_SAVE_UNSUPPORTED);
    },
  };
}
