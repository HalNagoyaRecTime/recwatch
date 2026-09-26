import type {
  ClassroomResponseDto,
  GatheringMemberResponseDto,
  ReplaceGatheringMembersRequestDto,
  StudentResponseDto,
} from "~/features/event-gatherings/api/dto/gathering-member-api-dto";
import type {
  MemberClassroom,
  MemberStudent,
} from "~/features/event-gatherings/model/gathering-member-candidate";

export function toMemberClassroom(
  response: ClassroomResponseDto
): MemberClassroom {
  return { id: response.class_room_id, name: response.class_name };
}

export function toMemberStudent(response: StudentResponseDto): MemberStudent {
  return {
    id: response.student_id,
    userId: response.user_id,
    name: response.display_name,
    classroomId: response.class_room.class_room_id,
    attendanceNumber: response.attendance_number,
    studentNumber: response.student_id_number,
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
