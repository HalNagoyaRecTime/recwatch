import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTeacherById: vi.fn(),
  getTeacherList: vi.fn(),
}));

vi.mock("~/features/teachers/api/http/teacher-http", () => ({
  teacherHttpApi: {
    getTeacherById: mocks.getTeacherById,
    getTeacherList: mocks.getTeacherList,
  },
}));

import { TeacherApi } from "~/features/teachers/api";

const teacherDto = {
  teacher_id: 7,
  user_id: 11,
  display_name: "佐橋 晴斗",
  email: "sahashi@example.com",
  is_live_active: true,
  is_staff: false,
  class_rooms: [{ class_room_id: 2, class_code: "2A", class_name: "2年A組" }],
};

describe("TeacherApi", () => {
  it("single and list reads return Domain rows without exposing DTOs", async () => {
    mocks.getTeacherById.mockResolvedValueOnce(teacherDto);
    mocks.getTeacherList.mockResolvedValueOnce({
      items: [teacherDto],
      total: 1,
      limit: 50,
      offset: 0,
    });

    await expect(TeacherApi.getTeacherById(7)).resolves.toEqual({
      teacherId: 7,
      userId: 11,
      displayName: "佐橋 晴斗",
      email: "sahashi@example.com",
      isLiveActive: true,
      isStaff: false,
      classRooms: [{ classRoomId: 2, classCode: "2A", className: "2年A組" }],
    });
    await expect(TeacherApi.getTeacherList()).resolves.toMatchObject({
      items: [
        expect.objectContaining({ teacherId: 7, displayName: "佐橋 晴斗" }),
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });
  });
});
