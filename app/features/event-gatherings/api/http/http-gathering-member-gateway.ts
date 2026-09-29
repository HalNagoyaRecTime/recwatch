import { loadAllPages } from "~/lib/load-all-pages";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import type {
  ClassroomPageResponseDto,
  GatheringMemberResponseDto,
  StudentPageResponseDto,
  TeacherPageResponseDto,
} from "~/features/event-gatherings/api/dto/gathering-member-api-dto";
import {
  toMemberClassroom,
  toMemberNonStudent,
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
      const [classrooms, students, teachers] = await Promise.all([
        loadAllPages(async (offset, limit) => {
          const page = await client.get<ClassroomPageResponseDto>(
            `/api/v1/classrooms?limit=${limit}&offset=${offset}`
          );
          return {
            items: page.items.map(toMemberClassroom),
            total: page.total,
          };
        }),
        // 停止中の学生も取得する。登録済みの参加者が停止されると、利用中だけの
        // 一覧では行が消えてチェックを外せず、参加者からも集合からも外せなくなるため。
        // 新しく追加させない制御は候補一覧側で行う。
        loadAllPages(async (offset, limit) => {
          const page = await client.get<StudentPageResponseDto>(
            `/api/v1/students?limit=${limit}&offset=${offset}&isLiveActive=all`
          );
          return {
            items: page.items.map(toMemberStudent),
            total: page.total,
          };
        }),
        // 教員は選択候補に出さず、学生以外の参加者の氏名を引くためだけに取得する。
        // 登録後に停止された教員も参加者に残るため、停止中も含める。
        loadAllPages(async (offset, limit) => {
          const page = await client.get<TeacherPageResponseDto>(
            `/api/v1/teachers?limit=${limit}&offset=${offset}&isLiveActive=all`
          );
          return {
            items: page.items.map(toMemberNonStudent),
            total: page.total,
          };
        }),
      ]);

      const nonStudents = new Map(
        teachers.map((teacher) => [teacher.userId, teacher])
      );
      return { classrooms, students, nonStudents };
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
