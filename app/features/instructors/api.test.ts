import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
vi.mock("~/lib/api-client", () => ({
  apiClient: { get: (...args: unknown[]) => getMock(...args) },
}));

import { TeacherApi, type TeacherDTO, type TeacherPageDTO } from "./api";

function makeTeacher(id: number): TeacherDTO {
  return {
    teacher_id: id,
    user_id: id,
    display_name: `教官${id}`,
    is_live_active: true,
    class_rooms: [],
  };
}

describe("TeacherApi.getAllTeachers", () => {
  it("101件目以降もpageを進めながら全ページ取得する", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => makeTeacher(i + 1));
    const page2 = [makeTeacher(101)];
    getMock
      .mockResolvedValueOnce({
        items: page1,
        total: 101,
        page: 1,
        limit: 100,
        total_pages: 2,
      } satisfies TeacherPageDTO)
      .mockResolvedValueOnce({
        items: page2,
        total: 101,
        page: 2,
        limit: 100,
        total_pages: 2,
      } satisfies TeacherPageDTO);

    const result = await TeacherApi.getAllTeachers();

    expect(result).toHaveLength(101);
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/teachers?limit=100&page=2"
    );
  });

  it("教官が0件のときは1回の呼び出しで空配列を返す", async () => {
    getMock.mockReset();
    getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      total_pages: 0,
    } satisfies TeacherPageDTO);

    const result = await TeacherApi.getAllTeachers();

    expect(result).toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(1);
  });
});
