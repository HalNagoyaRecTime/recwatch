import { loadAllPages } from "~/lib/load-all-pages";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import type {
  GatheringMemberResponseDto,
  StudentPageResponseDto,
  TeamPageResponseDto,
  TeacherPageResponseDto,
} from "~/features/event-gatherings/api/dto/gathering-member-api-dto";
import {
  toMemberNonStudent,
  toMemberStudent,
  toMemberTeam,
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
      const [teams, studentResponses, teachers] = await Promise.all([
        loadAllPages(async (offset, limit) => {
          const page = await client.get<TeamPageResponseDto>(
            `/api/v1/teams?limit=${limit}&offset=${offset}`
          );
          return page.items.map(toMemberTeam);
        }),
        // 停止中の学生も取得し、候補表では非表示にする。登録済みの停止中学生を
        // 学生以外の参加者と誤認せず、登録済みなら別枠で解除できるよう全件を取得する。
        loadAllPages(async (offset, limit) => {
          const page = await client.get<StudentPageResponseDto>(
            `/api/v1/students?limit=${limit}&offset=${offset}&isLiveActive=all&includeTotal=false`
          );
          return page.items;
        }),
        // 教員は選択候補に出さず、学生以外の参加者の氏名を引くためだけに取得する。
        // 登録後に停止された教員も参加者に残るため、停止中も含める。
        loadAllPages(async (offset, limit) => {
          const page = await client.get<TeacherPageResponseDto>(
            `/api/v1/teachers?limit=${limit}&offset=${offset}&isLiveActive=all&includeTotal=false`
          );
          return page.items.map(toMemberNonStudent);
        }),
      ]);

      const nonStudents = new Map(
        teachers.map((teacher) => [teacher.userId, teacher])
      );
      const teamIdByClassCode = new Map(
        teams.flatMap((team) =>
          team.classCodes.map((classCode) => [classCode, team.id] as const)
        )
      );
      const students = studentResponses.map((student) =>
        toMemberStudent(
          student,
          student.class_room
            ? (teamIdByClassCode.get(student.class_room.class_code) ?? null)
            : null
        )
      );
      return { teams, students, nonStudents };
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
