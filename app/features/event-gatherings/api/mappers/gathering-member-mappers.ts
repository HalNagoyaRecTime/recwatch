import type {
  ClassroomResponseDto,
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
  };
}
