import type {
  GatheringMemberResponseDto,
  ReplaceGatheringMembersRequestDto,
  StudentResponseDto,
  TeamResponseDto,
  TeacherResponseDto,
} from "~/features/events/api/dto/gathering-member-api-dto";
import type {
  MemberNonStudent,
  MemberStudent,
  MemberTeam,
} from "~/features/events/model/gathering-member-candidate";

export function toMemberTeam(response: TeamResponseDto): MemberTeam {
  return {
    id: response.team_id,
    name: response.team_name,
    classCodes: response.registered_classes,
  };
}

export function toMemberStudent(
  response: StudentResponseDto,
  teamId: number | null
): MemberStudent {
  return {
    id: response.student_id,
    userId: response.user_id,
    name: response.display_name,
    teamId,
    classroomId: response.class_room?.class_room_id ?? null,
    attendanceNumber: response.attendance_number,
    studentNumber: response.student_id_number,
    isLiveActive: response.is_live_active,
  };
}

export function toMemberNonStudent(
  response: TeacherResponseDto
): MemberNonStudent {
  return {
    userId: response.user_id,
    name: response.display_name,
    isLiveActive: response.is_live_active,
  };
}

/** 参加者一覧のレスポンスから、画面の選択状態として使う user_id だけを取り出す。 */
export function toMemberUserIds(
  response: readonly GatheringMemberResponseDto[]
): number[] {
  return response.map((member) => member.user_id);
}

export function toReplaceGatheringMembersRequest(
  userIds: readonly number[]
): ReplaceGatheringMembersRequestDto {
  return { user_ids: [...userIds] };
}
