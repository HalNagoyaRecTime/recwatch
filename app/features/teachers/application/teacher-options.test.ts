import { describe, expect, it, vi } from "vitest";

import { getActiveTeacherOptions } from "~/features/teachers/application/teacher-options";

describe("getActiveTeacherOptions", () => {
  it("active teacherだけをForm optionへ変換する", async () => {
    const getActiveTeachers = vi.fn().mockResolvedValue({
      items: [
        {
          teacherId: 3,
          userId: 30,
          displayName: "佐橋 晴斗",
          email: "sahashi@example.com",
          isLiveActive: true,
          isStaff: false,
          classRooms: [],
        },
      ],
      limit: 50,
      offset: 0,
      total: 1,
    });

    await expect(
      getActiveTeacherOptions({ getActiveTeachers })
    ).resolves.toEqual([{ displayName: "佐橋 晴斗", teacherId: 3 }]);
    expect(getActiveTeachers).toHaveBeenCalledOnce();
  });
});
