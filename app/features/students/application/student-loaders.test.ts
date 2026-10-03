import { describe, expect, it, vi } from "vitest";

import type { StudentManagementApi } from "~/features/students/api/contracts/student-api";
import type { StudentRow } from "~/features/students/model/student";
import {
  loadStudentManagementPage,
  parseStudentId,
} from "~/features/students/application/student-loaders";

describe("loadStudentManagementPage", () => {
  it("URL conditions and options are loaded together for the Route", async () => {
    const students: StudentRow[] = [];
    const api = {
      getStudents: vi.fn().mockResolvedValue({
        items: students,
        limit: 50,
        offset: 100,
        total: 100,
      }),
    } as unknown as StudentManagementApi;
    const result = await loadStudentManagementPage(
      "page=3&search=佐橋+晴斗&classRoomId=3&isStaff=false&isLiveActive=all&sortBy=className&sortOrder=desc",
      api
    );

    expect(api.getStudents).toHaveBeenCalledWith({
      limit: 50,
      offset: 100,
      search: "佐橋 晴斗",
      classRoomId: 3,
      isStaff: "false",
      isLiveActive: "all",
      sortBy: "className",
      sortOrder: "desc",
    });
    expect(result).toEqual({
      limit: 50,
      offset: 100,
      students,
      total: 100,
    });
  });

  it("uses default filters for the list loader", async () => {
    const students: StudentRow[] = [];
    const api = {
      getStudents: vi.fn().mockResolvedValue({
        items: students,
        limit: 50,
        offset: 0,
        total: 0,
      }),
    } as unknown as StudentManagementApi;

    const result = await loadStudentManagementPage("", api);

    expect(api.getStudents).toHaveBeenCalledWith({
      limit: 50,
      offset: 0,
      search: undefined,
      classRoomId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      isStaff: "all",
      isLiveActive: "true",
    });
    expect(result).toMatchObject({
      limit: 50,
      offset: 0,
      students,
      total: 0,
    });
  });

  it("returns a loader error when the list request fails", async () => {
    const api = {
      getStudents: vi.fn().mockRejectedValue(new Error("list failed")),
    } as unknown as StudentManagementApi;

    await expect(loadStudentManagementPage("", api)).rejects.toThrow(
      "list failed"
    );
  });

  it("accepts only positive integer student IDs", () => {
    expect(parseStudentId("42")).toBe(42);
    expect(() => parseStudentId("0")).toThrow();
    expect(() => parseStudentId("not-a-number")).toThrow();
  });
});
