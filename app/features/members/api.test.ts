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
    display_name: `学生${id}`,
    class_room_id: 1,
    class_room_name: "クラスA",
    attendance_number: id,
    student_id_number: String(id),
    is_live_active: true,
  };
}

describe("StudentApi.getAllStudents", () => {
  it("1ページ目で全件取得できる場合は1回だけ呼び出す", async () => {
    const students = [makeStudent(1), makeStudent(2)];
    getMock.mockResolvedValueOnce({
      students,
      total: 2,
      limit: 100,
      offset: 0,
    } satisfies StudentPageDTO);

    const result = await StudentApi.getAllStudents();

    expect(result).toEqual(students);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith("/api/v1/students?limit=100&offset=0");
  });

  it("101件目以降もoffsetを進めながら全ページ取得する", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => makeStudent(i + 1));
    const page2 = [makeStudent(101)];
    getMock.mockReset();
    getMock
      .mockResolvedValueOnce({
        students: page1,
        total: 101,
        limit: 100,
        offset: 0,
      } satisfies StudentPageDTO)
      .mockResolvedValueOnce({
        students: page2,
        total: 101,
        limit: 100,
        offset: 100,
      } satisfies StudentPageDTO);

    const result = await StudentApi.getAllStudents();

    expect(result).toHaveLength(101);
    expect(result[100]).toEqual(makeStudent(101));
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/students?limit=100&offset=100"
    );
  });

  it("学生が0件のときは1回の呼び出しで空配列を返す", async () => {
    getMock.mockReset();
    getMock.mockResolvedValueOnce({
      students: [],
      total: 0,
      limit: 100,
      offset: 0,
    } satisfies StudentPageDTO);

    const result = await StudentApi.getAllStudents();

    expect(result).toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(1);
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

  it("updates an existing student through the supported API", async () => {
    const updated = makeStudent(3);
    putMock.mockResolvedValueOnce(updated);

    await StudentApi.updateStudent(3, {
      attendanceNumber: 4,
      classRoomId: 1,
      displayName: "更新後",
      studentIdNumber: "S003",
    });

    expect(putMock).toHaveBeenCalledWith("/api/v1/students/3", {
      attendance_number: 4,
      class_room_id: 1,
      display_name: "更新後",
      student_id_number: "S003",
    });
  });

  it("deletes a student through the supported API", async () => {
    deleteMock.mockResolvedValueOnce(undefined);

    await StudentApi.deleteStudent(3);

    expect(deleteMock).toHaveBeenCalledWith("/api/v1/students/3");
  });
});
