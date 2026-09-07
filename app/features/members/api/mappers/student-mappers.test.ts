import { describe, expect, it } from "vitest";

import { toStudentRow } from "~/features/members/api/mappers/student-mappers";

describe("toStudentRow", () => {
  it("DTOのsnake_caseを画面用のmodelへ変換する", () => {
    expect(
      toStudentRow({
        student_id: 7,
        user_id: 11,
        display_name: "山田 花子",
        student_id_number: "S007",
        attendance_number: 3,
        is_live_active: false,
        is_staff: true,
        class_room: {
          class_room_id: 4,
          class_code: "A-1",
          class_name: "1年A組",
        },
      })
    ).toEqual({
      studentId: 7,
      userId: 11,
      displayName: "山田 花子",
      studentIdNumber: "S007",
      attendanceNumber: 3,
      isLiveActive: false,
      isStaff: true,
      classRoom: {
        classRoomId: 4,
        classCode: "A-1",
        className: "1年A組",
      },
    });
  });
});
