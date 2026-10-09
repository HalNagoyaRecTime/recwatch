import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentApi } from "~/features/students/api";
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
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
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
    await user.type(screen.getByLabelText("出席番号*"), "8");
    await user.selectOptions(screen.getByLabelText("クラス*"), "1");
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
    });
    expect(getStudentById).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });
});
