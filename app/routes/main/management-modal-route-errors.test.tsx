import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import ClassRoomRoute, {
  clientLoader as classRoomsLoader,
} from "~/routes/main/classrooms";
import ClassRoomEditRoute, {
  ErrorBoundary as ClassRoomEditErrorBoundary,
} from "~/routes/main/classrooms.$classRoomId.edit";
import { ApiClientError } from "~/lib/api-client-error";
import { StudentApi } from "~/features/students/api";
import StudentsRoute, {
  clientLoader as studentsLoader,
} from "~/routes/main/students";
import StudentEditRoute, {
  ErrorBoundary as StudentEditErrorBoundary,
} from "~/routes/main/students.$studentId.edit";
import { TeacherApi } from "~/features/teachers/api";
import TeachersRoute, {
  clientLoader as teachersLoader,
} from "~/routes/main/teachers";
import TeacherEditRoute, {
  ErrorBoundary as TeacherEditErrorBoundary,
} from "~/routes/main/teachers.$teacherId.edit";
import { managementRouteIds } from "~/routes/main/management-route-ids";

const mocks = vi.hoisted(() => ({
  getClassRoomData: vi.fn(),
}));

vi.mock("~/features/classRoom/application/class-room-options", () => ({
  getClassRoomData: mocks.getClassRoomData,
}));

const emptyPage = {
  items: [],
  limit: 50,
  offset: 0,
  total: 100,
};

afterEach(() => {
  vi.restoreAllMocks();
  mocks.getClassRoomData.mockReset();
});

function renderManagementRouter(
  routes: Parameters<typeof createMemoryRouter>[0],
  initialEntry: string
) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  render(<RouterProvider router={router} />);
  return router;
}

async function closeErrorModal(
  router: ReturnType<typeof renderManagementRouter>,
  listPath: string,
  listSearch: string,
  heading: string,
  message: string,
  user: ReturnType<typeof userEvent.setup>
) {
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();

  const dialog = screen.getByRole("dialog");
  await user.click(
    within(dialog).getAllByRole("button", { name: "閉じる" })[0]
  );

  await waitFor(() => expect(router.state.location.pathname).toBe(listPath));
  expect(router.state.location.search).toBe(listSearch);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
}

describe("management edit route error boundaries", () => {
  it("学生編集の読み込み失敗は一覧を残したモーダルで表示し、条件を保って閉じられる", async () => {
    const user = userEvent.setup();
    const getStudents = vi
      .spyOn(StudentApi, "getStudents")
      .mockResolvedValue(emptyPage);
    mocks.getClassRoomData.mockResolvedValue([]);

    const router = renderManagementRouter(
      [
        {
          id: managementRouteIds.students,
          path: "/students",
          loader: ({ request }) => studentsLoader({ request }),
          element: <StudentsRoute />,
          children: [
            {
              path: ":studentId/edit",
              loader: () => {
                throw new ApiClientError(404, "student missing");
              },
              element: <StudentEditRoute />,
              errorElement: <StudentEditErrorBoundary />,
            },
          ],
        },
      ],
      "/students/7/edit?search=keep&page=2"
    );

    await closeErrorModal(
      router,
      "/students",
      "?search=keep&page=2",
      "学生管理",
      "エラー404:student missing",
      user
    );
    expect(getStudents).toHaveBeenCalledOnce();
  });

  it("教官編集の読み込み失敗は一覧を残したモーダルで表示し、条件を保って閉じられる", async () => {
    const user = userEvent.setup();
    const getTeachers = vi
      .spyOn(TeacherApi, "getTeacherList")
      .mockResolvedValue(emptyPage);
    mocks.getClassRoomData.mockResolvedValue([]);

    const router = renderManagementRouter(
      [
        {
          id: managementRouteIds.teachers,
          path: "/teachers",
          loader: ({ request }) => teachersLoader({ request }),
          element: <TeachersRoute />,
          children: [
            {
              path: ":teacherId/edit",
              loader: () => {
                throw new ApiClientError(404, "teacher missing");
              },
              element: <TeacherEditRoute />,
              errorElement: <TeacherEditErrorBoundary />,
            },
          ],
        },
      ],
      "/teachers/7/edit?search=keep&page=2"
    );

    await closeErrorModal(
      router,
      "/teachers",
      "?search=keep&page=2",
      "教官管理",
      "エラー404:teacher missing",
      user
    );
    expect(getTeachers).toHaveBeenCalledOnce();
  });

  it("クラス編集の読み込み失敗は一覧を残したモーダルで表示し、条件を保って閉じられる", async () => {
    const user = userEvent.setup();
    const getClassRooms = vi
      .spyOn(ClassRoomApi, "getClassRoomList")
      .mockResolvedValue(emptyPage);
    vi.spyOn(TeacherApi, "getActiveTeachers").mockResolvedValue(emptyPage);

    const router = renderManagementRouter(
      [
        {
          id: managementRouteIds.classrooms,
          path: "/classrooms",
          loader: ({ request }) => classRoomsLoader({ request }),
          element: <ClassRoomRoute />,
          children: [
            {
              path: ":classRoomId/edit",
              loader: () => {
                throw new ApiClientError(404, "classroom missing");
              },
              element: <ClassRoomEditRoute />,
              errorElement: <ClassRoomEditErrorBoundary />,
            },
          ],
        },
      ],
      "/classrooms/12/edit?search=keep&page=2"
    );

    await closeErrorModal(
      router,
      "/classrooms",
      "?search=keep&page=2",
      "クラス管理",
      "エラー404:classroom missing",
      user
    );
    expect(getClassRooms).toHaveBeenCalledOnce();
  });
});
