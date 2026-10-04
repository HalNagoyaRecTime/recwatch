import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoom } from "~/features/classRoom/model/classRoom";
import { StudentApi } from "~/features/students/api";
import { TeacherApi } from "~/features/teachers/api";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { clientLoader as classRoomEditLoader } from "~/routes/main/classrooms.$classRoomId.edit";
import { clientLoader as studentEditLoader } from "~/routes/main/students.$studentId.edit";
import { clientLoader as teacherEditLoader } from "~/routes/main/teachers.$teacherId.edit";

const teacher: TeacherRow = {
  teacherId: 7,
  userId: 11,
  displayName: "佐橋 晴斗",
  email: "sahashi@example.com",
  isLiveActive: true,
  isStaff: false,
  classRooms: [],
};

const classRoom: ClassRoom = {
  classRoomId: 12,
  classCode: "1A",
  className: "1年A組",
  studentCount: 3,
  teacher: null,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("management edit clientLoaders", () => {
  it("直接開いた教官編集RouteはTeacherApiから単体取得する", async () => {
    const getTeacherById = vi
      .spyOn(TeacherApi, "getTeacherById")
      .mockResolvedValue(teacher);

    await expect(
      teacherEditLoader({ params: { teacherId: "7" } })
    ).resolves.toEqual({
      teacher,
    });
    expect(getTeacherById).toHaveBeenCalledOnce();
    expect(getTeacherById).toHaveBeenCalledWith(7);
  });

  it.each(["0", "-1", "abc", "1.5", "", undefined])(
    "不正な学生ID(%s)は404として扱い、APIを呼ばない",
    async (studentId) => {
      const getStudentById = vi.spyOn(StudentApi, "getStudentById");

      await expect(
        studentEditLoader({ params: { studentId } })
      ).rejects.toMatchObject({ status: 404 });
      expect(getStudentById).not.toHaveBeenCalled();
    }
  );

  it.each(["0", "-1", "abc", "1.5", "", undefined])(
    "不正な教官ID(%s)は404として扱い、APIを呼ばない",
    async (teacherId) => {
      const getTeacherById = vi.spyOn(TeacherApi, "getTeacherById");

      await expect(
        teacherEditLoader({ params: { teacherId } })
      ).rejects.toMatchObject({ status: 404 });
      expect(getTeacherById).not.toHaveBeenCalled();
    }
  );

  it("直接開いたクラス編集RouteはClassRoomApiから単体取得する", async () => {
    const getClassRoomById = vi
      .spyOn(ClassRoomApi, "getClassRoomById")
      .mockResolvedValue(classRoom);
    const getStudents = vi.spyOn(StudentApi, "getStudents").mockResolvedValue({
      items: [],
      limit: 10,
      offset: 0,
      total: 0,
    });

    await expect(
      classRoomEditLoader({ params: { classRoomId: "12" } })
    ).resolves.toEqual({
      classRoom,
      memberPage: { items: [], limit: 10, offset: 0, total: 0 },
      search: "",
      searchResults: null,
    });
    expect(getClassRoomById).toHaveBeenCalledOnce();
    expect(getClassRoomById).toHaveBeenCalledWith(12);
    expect(getStudents).toHaveBeenCalledWith({
      classRoomId: 12,
      limit: 10,
      offset: 0,
      sortBy: "attendanceNumber",
      sortOrder: "asc",
    });
  });

  it("クラス編集Routeは所属一覧のページとStudent検索を分けて取得する", async () => {
    vi.spyOn(ClassRoomApi, "getClassRoomById").mockResolvedValue(classRoom);
    const getStudents = vi.spyOn(StudentApi, "getStudents");
    getStudents.mockResolvedValue({
      items: [],
      limit: 10,
      offset: 0,
      total: 0,
    });

    await classRoomEditLoader({
      params: { classRoomId: "12" },
      request: new Request(
        "https://example.test/classrooms/12/edit?memberPage=3&studentSearch=%E5%B1%B1%E7%94%B0"
      ),
    });

    expect(getStudents).toHaveBeenNthCalledWith(1, {
      classRoomId: 12,
      limit: 10,
      offset: 20,
      sortBy: "attendanceNumber",
      sortOrder: "asc",
    });
    expect(getStudents).toHaveBeenNthCalledWith(2, {
      limit: 10,
      offset: 0,
      search: "山田",
      sortBy: "displayName",
      sortOrder: "asc",
    });
  });

  it.each(["0", "-1", "abc", "1.5", "", undefined])(
    "不正なクラスID(%s)は404として扱い、APIを呼ばない",
    async (classRoomId) => {
      const getClassRoomById = vi.spyOn(ClassRoomApi, "getClassRoomById");

      await expect(
        classRoomEditLoader({ params: { classRoomId } })
      ).rejects.toMatchObject({ status: 404 });
      expect(getClassRoomById).not.toHaveBeenCalled();
    }
  );
});
