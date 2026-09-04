import { describe, expect, it } from "vitest";

import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";

describe("toTeacherRow", () => {
  it("DTOのsnake_caseを画面用のModelへ変換する", () => {
    expect(
      toTeacherRow({
        teacher_id: 7,
        user_id: 11,
        display_name: "佐橋 晴斗",
        is_live_active: true,
        is_staff: false,
        class_rooms: [
          { class_room_id: 3, class_code: "A-1", class_name: "1年A組" },
        ],
      })
    ).toEqual({
      teacherId: 7,
      displayName: "佐橋 晴斗",
      isLiveActive: true,
      isStaff: false,
      classRooms: [{ classRoomId: 3, classCode: "A-1", className: "1年A組" }],
    });
  });
});
