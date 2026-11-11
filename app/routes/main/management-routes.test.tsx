import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentApi } from "~/features/students/api";
import { ApiClientError } from "~/lib/api-client-error";
import {
  UPDATE_CONFLICT_MESSAGE,
  UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE,
} from "~/lib/update-conflict";
import type { StudentRow } from "~/features/students/model/student";
import StudentCreateRoute from "~/routes/main/students.new";
import StudentEditRoute, {
  clientLoader as studentEditLoader,
} from "~/routes/main/students.$studentId.edit";
import StudentsRoute, {
  clientLoader as studentsLoader,
} from "~/routes/main/students";
import { managementRouteIds } from "~/routes/main/management-route-ids";

const mocks = vi.hoisted(() => ({
  getClassRoomData: vi.fn(),
}));

vi.mock("~/features/classRoom/application/class-room-options", () => ({
  getClassRoomData: mocks.getClassRoomData,
}));

const classRoom = {
  classRoomId: 1,
  classCode: "1A",
  className: "1年Aクラス",
  studentCount: 1,
  teacher: null,
};

const student: StudentRow = {
  studentId: 7,
  userId: 107,
  displayName: "山田太郎",
  studentIdNumber: "S007",
  attendanceNumber: 7,
  isLiveActive: true,
  isStaff: false,
  classRoom: {
    classRoomId: 1,
    classCode: "1A",
    className: "1年Aクラス",
  },
  lockVersion: 0,
};

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <output data-testid="location-pathname">{location.pathname}</output>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

function StudentsRouteWithLocation() {
  return (
    <>
      <StudentsRoute />
      <LocationProbe />
    </>
  );
}

function renderStudentsRouter(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        id: managementRouteIds.students,
        path: "/students",
        loader: ({ request }) => studentsLoader({ request }),
        element: <StudentsRouteWithLocation />,
        children: [
          { path: "new", element: <StudentCreateRoute /> },
          {
            path: ":studentId/edit",
            loader: ({ params }) => studentEditLoader({ params }),
            element: <StudentEditRoute />,
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] }
  );

  render(<RouterProvider router={router} />);
  return router;
}

function mockStudentList() {
  return vi.spyOn(StudentApi, "getStudents").mockImplementation((query = {}) =>
    Promise.resolve({
      items: [student],
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
      total: 100,
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("student management nested routes", () => {
  it("直接開いた新規登録Routeをキャンセルすると検索条件つき一覧へ戻る", async () => {
    const user = userEvent.setup();
    const getStudents = mockStudentList();
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderStudentsRouter("/students/new?search=keep&page=2");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );

    expect(router.state.location.search).toBe("?search=keep&page=2");
    expect(getStudents).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("新規登録成功後は条件つき一覧へ戻り、一覧だけを再検証する", async () => {
    const user = userEvent.setup();
    const getStudents = mockStudentList();
    const createStudent = vi
      .spyOn(StudentApi, "createStudent")
      .mockResolvedValue(student);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderStudentsRouter("/students/new?search=keep&page=2");

    await user.type(await screen.findByLabelText("氏名*"), "新規学生");
    await user.type(screen.getByLabelText("学籍番号*"), "S008");
    await user.type(screen.getByLabelText("出席番号"), "8");
    await user.selectOptions(screen.getByLabelText("クラス"), "1");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
    expect(router.state.location.search).toBe("?search=keep&page=2");
    expect(createStudent).toHaveBeenCalledWith({
      attendanceNumber: 8,
      classRoomId: 1,
      displayName: "新規学生",
      studentIdNumber: "S008",
    });
  });

  it("競合後の再取得に失敗してもエラー画面へ切り替わらず、モーダルと入力を残す", async () => {
    const user = userEvent.setup();
    mockStudentList();
    vi.spyOn(StudentApi, "getStudentById")
      .mockResolvedValueOnce(student)
      .mockRejectedValue(new Error("network"));
    vi.spyOn(StudentApi, "updateStudent").mockRejectedValue(
      new ApiClientError(409, "conflict", "STUDENT_UPDATE_CONFLICT")
    );
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    renderStudentsRouter("/students/7/edit");

    const name = await screen.findByLabelText("氏名*");
    await user.clear(name);
    await user.type(name, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("氏名*")).toHaveValue("自分の変更");
    expect(
      screen.queryByText("学生情報を読み込めません")
    ).not.toBeInTheDocument();
  });

  it("競合のあと保存せずに閉じると一覧を再検証する", async () => {
    const user = userEvent.setup();
    const getStudents = mockStudentList();
    vi.spyOn(StudentApi, "getStudentById").mockResolvedValue(student);
    vi.spyOn(StudentApi, "updateStudent").mockRejectedValue(
      new ApiClientError(409, "conflict", "STUDENT_UPDATE_CONFLICT")
    );
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderStudentsRouter("/students/7/edit");

    await screen.findByLabelText("氏名*");
    await waitFor(() => expect(getStudents).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: "保存する" }));
    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    expect(getStudents).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
  });

  it("競合がなければ閉じても一覧を再検証しない", async () => {
    const user = userEvent.setup();
    const getStudents = mockStudentList();
    vi.spyOn(StudentApi, "getStudentById").mockResolvedValue(student);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderStudentsRouter("/students/7/edit");

    await screen.findByLabelText("氏名*");
    await waitFor(() => expect(getStudents).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    expect(getStudents).toHaveBeenCalledOnce();
  });

  it("編集Routeは単体取得し、保存後は一覧だけを再検証する", async () => {
    const user = userEvent.setup();
    const getStudents = mockStudentList();
    const getStudentById = vi
      .spyOn(StudentApi, "getStudentById")
      .mockResolvedValue(student);
    const updateStudent = vi
      .spyOn(StudentApi, "updateStudent")
      .mockResolvedValue(student);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderStudentsRouter(
      "/students/7/edit?search=keep&sortBy=displayName"
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByLabelText("氏名*")).toHaveValue("山田太郎");
    expect(getStudentById).toHaveBeenCalledOnce();
    expect(getStudentById).toHaveBeenCalledWith(7);

    await user.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));

    expect(router.state.location.search).toBe(
      "?search=keep&sortBy=displayName"
    );
    expect(updateStudent).toHaveBeenCalledWith(7, {
      attendanceNumber: 7,
      classRoomId: 1,
      displayName: "山田太郎",
      studentIdNumber: "S007",
      lockVersion: 0,
    });
    expect(getStudentById).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("未所属の学生はクラスと出席番号を空欄のまま編集保存できる", async () => {
    const user = userEvent.setup();
    mockStudentList();
    const unassignedStudent: StudentRow = {
      ...student,
      attendanceNumber: null,
      classRoom: null,
    };
    vi.spyOn(StudentApi, "getStudentById").mockResolvedValue(unassignedStudent);
    const updateStudent = vi
      .spyOn(StudentApi, "updateStudent")
      .mockResolvedValue(unassignedStudent);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    renderStudentsRouter("/students/7/edit");

    const name = await screen.findByLabelText("氏名*");
    await user.clear(name);
    await user.type(name, "山田 花子");
    expect(screen.getByLabelText("出席番号")).toHaveValue(null);
    expect(screen.getByLabelText("クラス")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(updateStudent).toHaveBeenCalledWith(7, {
        attendanceNumber: null,
        classRoomId: null,
        displayName: "山田 花子",
        studentIdNumber: "S007",
        lockVersion: 0,
      })
    );
  });
});
