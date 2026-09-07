import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock("~/lib/api-client", () => ({
  apiClient: {
    get: mocks.get,
    post: mocks.post,
    put: mocks.put,
  },
}));

import { StudentApi } from "./api";
import { studentHttpApi } from "./api/http/student-http";
import type { StudentDTO, StudentPageDTO } from "./api/dto/student-dto";

function makeStudentDTO(id: number): StudentDTO {
  return {
    student_id: id,
    user_id: id + 100,
    display_name: `学生${id}`,
    student_id_number: String(id),
    attendance_number: id,
    is_live_active: true,
    is_staff: false,
    class_room: {
      class_room_id: 1,
      class_code: "1A",
      class_name: "クラスA",
    },
  };
}

function makePage(): StudentPageDTO {
  return {
    items: [makeStudentDTO(1)],
    total: 1,
    limit: 50,
    offset: 50,
  };
}

describe("studentHttpApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("検索・絞り込み・ソート・ページングをAPI契約へ変換する", async () => {
    mocks.get.mockResolvedValueOnce(makePage());

    await expect(
      studentHttpApi.getStudents({
        limit: 50,
        offset: 50,
        search: " 山田 ",
        classRoomId: 1,
        isStaff: "false",
        isLiveActive: "true",
        sortBy: "className",
        sortOrder: "desc",
      })
    ).resolves.toEqual(makePage());

    expect(mocks.get).toHaveBeenCalledWith(
      "/api/v1/students?limit=50&offset=50&search=%E5%B1%B1%E7%94%B0&classRoomId=1&isStaff=false&isLiveActive=true&sortBy=className&sortOrder=desc"
    );
  });

  it("一覧条件未指定時はstaff=all・active=allを既定値にする", async () => {
    mocks.get.mockResolvedValueOnce(makePage());

    await studentHttpApi.getStudents();

    expect(mocks.get).toHaveBeenCalledWith(
      "/api/v1/students?limit=50&offset=0&isStaff=all&isLiveActive=all&sortBy=studentId&sortOrder=asc"
    );
  });

  it.each([
    "studentId",
    "studentIdNumber",
    "displayName",
    "classCode",
    "className",
    "attendanceNumber",
    "isStaff",
    "isLiveActive",
  ] as const)("8種類のsortBy（%s）を送信する", async (sortBy) => {
    mocks.get.mockResolvedValueOnce(makePage());

    await studentHttpApi.getStudents({ sortBy, sortOrder: "desc" });

    expect(mocks.get).toHaveBeenCalledWith(
      `/api/v1/students?limit=50&offset=0&isStaff=all&isLiveActive=all&sortBy=${sortBy}&sortOrder=desc`
    );
  });

  it.each(["true", "false", "all"] as const)(
    "isStaff=%sを送信する",
    async (isStaff) => {
      mocks.get.mockResolvedValueOnce(makePage());

      await studentHttpApi.getStudents({ isStaff });

      expect(mocks.get).toHaveBeenCalledWith(
        `/api/v1/students?limit=50&offset=0&isStaff=${isStaff}&isLiveActive=all&sortBy=studentId&sortOrder=asc`
      );
    }
  );

  it.each(["true", "false", "all"] as const)(
    "isLiveActive=%sを送信する",
    async (isLiveActive) => {
      mocks.get.mockResolvedValueOnce(makePage());

      await studentHttpApi.getStudents({ isLiveActive });

      expect(mocks.get).toHaveBeenCalledWith(
        `/api/v1/students?limit=50&offset=0&isStaff=all&isLiveActive=${isLiveActive}&sortBy=studentId&sortOrder=asc`
      );
    }
  );

  it("作成・更新には書き込み項目だけを送信する", async () => {
    mocks.post.mockResolvedValueOnce(makeStudentDTO(3));
    mocks.put.mockResolvedValueOnce(makeStudentDTO(3));
    const input = {
      attendanceNumber: 3,
      classRoomId: 1,
      displayName: "学生3",
      studentIdNumber: "S003",
    };

    await studentHttpApi.createStudent(input);
    await studentHttpApi.updateStudent(3, input);

    const body = {
      attendance_number: 3,
      class_room_id: 1,
      display_name: "学生3",
      student_id_number: "S003",
    };
    expect(mocks.post).toHaveBeenCalledWith("/api/v1/students", body);
    expect(mocks.put).toHaveBeenCalledWith("/api/v1/students/3", body);
    expect(JSON.stringify(mocks.post.mock.calls[0][1])).not.toContain(
      "isStaff"
    );
    expect(JSON.stringify(mocks.post.mock.calls[0][1])).not.toContain(
      "isLiveActive"
    );
  });
});

describe("StudentApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("外部DTOを画面用のStudent modelへ変換する", async () => {
    mocks.get.mockResolvedValueOnce(makePage());

    await expect(StudentApi.getStudents()).resolves.toEqual({
      items: [
        {
          studentId: 1,
          userId: 101,
          displayName: "学生1",
          studentIdNumber: "1",
          attendanceNumber: 1,
          isLiveActive: true,
          isStaff: false,
          classRoom: {
            classRoomId: 1,
            classCode: "1A",
            className: "クラスA",
          },
        },
      ],
      total: 1,
      limit: 50,
      offset: 50,
    });
  });
});
