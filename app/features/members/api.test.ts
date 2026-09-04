import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();
const deleteMock = vi.fn();
vi.mock("~/lib/api-client", () => ({
  apiClient: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    put: (...args: unknown[]) => putMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
  },
}));

import { StudentApi, type StudentDTO, type StudentPageDTO } from "./api";

function makeStudent(id: number): StudentDTO {
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

describe("StudentApi.getStudents", () => {
  it("検索・絞り込み・ソート・ページングをAPI契約へ変換する", async () => {
    const page = {
      items: [makeStudent(1)],
      total: 1,
      limit: 50,
      offset: 50,
    } satisfies StudentPageDTO;
    getMock.mockResolvedValueOnce(page);

    await expect(
      StudentApi.getStudents({
        limit: 50,
        offset: 50,
        search: "山田",
        classRoomId: 1,
        isStaff: "false",
        isLiveActive: "true",
        sortBy: "className",
        sortOrder: "desc",
      })
    ).resolves.toEqual(page);

    expect(getMock).toHaveBeenCalledWith(
      "/api/v1/students?limit=50&offset=50&search=%E5%B1%B1%E7%94%B0&classRoomId=1&isStaff=false&isLiveActive=true&sortBy=className&sortOrder=desc"
    );
  });
});

describe("StudentApi mutations", () => {
  it("maps the individual-registration input to the backend contract", async () => {
    const created = makeStudent(3);
    postMock.mockResolvedValueOnce(created);

    await expect(
      StudentApi.createStudent({
        attendanceNumber: 3,
        classRoomId: 1,
        displayName: "学生3",
        studentIdNumber: "S003",
      })
    ).resolves.toEqual(created);

    expect(postMock).toHaveBeenCalledWith("/api/v1/students", {
      attendance_number: 3,
      class_room_id: 1,
      display_name: "学生3",
      student_id_number: "S003",
    });
  });

  it("updates and deletes a student through the supported API", async () => {
    putMock.mockResolvedValueOnce(makeStudent(3));
    deleteMock.mockResolvedValueOnce(undefined);

    await StudentApi.updateStudent(3, {
      attendanceNumber: 4,
      classRoomId: 1,
      displayName: "更新後",
      studentIdNumber: "S003",
    });
    await StudentApi.deleteStudent(3);

    expect(putMock).toHaveBeenCalledWith("/api/v1/students/3", {
      attendance_number: 4,
      class_room_id: 1,
      display_name: "更新後",
      student_id_number: "S003",
    });
    expect(deleteMock).toHaveBeenCalledWith("/api/v1/students/3");
  });
});
