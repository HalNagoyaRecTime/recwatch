import { loadAllPages } from "~/lib/load-all-pages";

import type { GatheringMemberGateway } from "~/features/events/api/contracts/gathering-member-gateway";
import type {
  GatheringMemberResponseDto,
  StudentPageResponseDto,
  TeamPageResponseDto,
  TeacherPageResponseDto,
} from "~/features/events/api/dto/gathering-member-api-dto";
import {
  toMemberNonStudent,
  toMemberStudent,
  toMemberTeam,
  toMemberUserIds,
  toReplaceGatheringMembersRequest,
} from "~/features/events/api/mappers/gathering-member-mappers";

type GatheringMemberHttpClient = {
  get<T>(path: string): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTeamPage(value: TeamPageResponseDto) {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    !value.items.every(
      (item) =>
        isRecord(item) &&
        Number.isSafeInteger(item.team_id) &&
        Number(item.team_id) > 0 &&
        typeof item.team_name === "string" &&
        Array.isArray(item.registered_classes) &&
        item.registered_classes.every(
          (classCode) => typeof classCode === "string"
        )
    ) ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0
  ) {
    throw new Error("チーム一覧のレスポンス形式が正しくありません。");
  }
  return value;
}

function parseStudentPage(value: StudentPageResponseDto) {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    !value.items.every(
      (item) =>
        isRecord(item) &&
        Number.isSafeInteger(item.student_id) &&
        Number(item.student_id) > 0 &&
        Number.isSafeInteger(item.user_id) &&
        Number(item.user_id) > 0 &&
        typeof item.display_name === "string" &&
        (item.attendance_number === null ||
          Number.isSafeInteger(item.attendance_number)) &&
        typeof item.student_id_number === "string" &&
        typeof item.is_live_active === "boolean" &&
        // クラス未所属の学生も参加者に選べるため、class_room は null を許す。
        (item.class_room === null ||
          (isRecord(item.class_room) &&
            Number.isSafeInteger(item.class_room.class_room_id) &&
            Number(item.class_room.class_room_id) > 0 &&
            typeof item.class_room.class_code === "string" &&
            typeof item.class_room.class_name === "string"))
    ) ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0
  ) {
    throw new Error("学生一覧のレスポンス形式が正しくありません。");
  }
  return value;
}

function parseTeacherPage(value: TeacherPageResponseDto) {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    !value.items.every(
      (item) =>
        isRecord(item) &&
        Number.isSafeInteger(item.user_id) &&
        Number(item.user_id) > 0 &&
        typeof item.display_name === "string" &&
        typeof item.is_live_active === "boolean"
    ) ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0
  ) {
    throw new Error("教員一覧のレスポンス形式が正しくありません。");
  }
  return value;
}

function parseMemberList(value: unknown): GatheringMemberResponseDto[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (member) =>
        isRecord(member) &&
        Number.isSafeInteger(member.gathering_group_member_id) &&
        Number(member.gathering_group_member_id) > 0 &&
        Number.isSafeInteger(member.gathering_id) &&
        Number(member.gathering_id) > 0 &&
        Number.isSafeInteger(member.user_id) &&
        Number(member.user_id) > 0
    )
  ) {
    throw new Error("参加者一覧のレスポンス形式が正しくありません。");
  }
  return value as GatheringMemberResponseDto[];
}

export function createHttpGatheringMemberGateway(
  client: GatheringMemberHttpClient
): GatheringMemberGateway {
  return {
    async loadCandidates() {
      const [teams, studentResponses, teachers] = await Promise.all([
        loadAllPages(async (offset, limit) => {
          const page = parseTeamPage(
            await client.get<TeamPageResponseDto>(
              `/api/v1/teams?limit=${limit}&offset=${offset}`
            )
          );
          return {
            items: page.items.map(toMemberTeam),
            total: page.total,
          };
        }),
        // 停止中の学生も取得し、候補表では非表示にする。登録済みの停止中学生を
        // 学生以外の参加者と誤認せず、登録済みなら別枠で解除できるよう全件を取得する。
        loadAllPages(async (offset, limit) => {
          const page = parseStudentPage(
            await client.get<StudentPageResponseDto>(
              `/api/v1/students?limit=${limit}&offset=${offset}&isLiveActive=all`
            )
          );
          return {
            items: page.items,
            total: page.total,
          };
        }),
        // 教員は選択候補に出さず、学生以外の参加者の氏名を引くためだけに取得する。
        // 登録後に停止された教員も参加者に残るため、停止中も含める。
        loadAllPages(async (offset, limit) => {
          const page = parseTeacherPage(
            await client.get<TeacherPageResponseDto>(
              `/api/v1/teachers?limit=${limit}&offset=${offset}&isLiveActive=all`
            )
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
      const response = parseMemberList(
        await client.get<GatheringMemberResponseDto[]>(
          `/api/v1/gatherings/${gatheringId}/members`
        )
      );
      return toMemberUserIds(response);
    },

    // 参加者は 1 人ずつ追加・削除せず、選択内容全体を 1 回の PUT で置き換える。
    async saveMembers(gatheringId, userIds) {
      const response = parseMemberList(
        await client.put<GatheringMemberResponseDto[]>(
          `/api/v1/gatherings/${gatheringId}/members`,
          toReplaceGatheringMembersRequest(userIds)
        )
      );
      return toMemberUserIds(response);
    },
  };
}
