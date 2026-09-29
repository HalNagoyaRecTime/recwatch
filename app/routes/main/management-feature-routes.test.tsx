import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  RouterProvider,
  useRouteLoaderData,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import ClassRoomEditRoute, {
  clientLoader as classRoomEditLoader,
} from "~/routes/main/classrooms.$classRoomId.edit";
import ClassRoomRoute, {
  clientLoader as classRoomsLoader,
} from "~/routes/main/classrooms";
import { StudentApi } from "~/features/students/api";
import StudentsRoute, {
  clientLoader as studentsLoader,
} from "~/routes/main/students";
import { TeacherApi } from "~/features/teachers/api";
import TeacherCreateRoute from "~/routes/main/teachers.new";
import TeachersRoute, {
  clientLoader as teachersLoader,
} from "~/routes/main/teachers";
import { managementRouteIds } from "~/routes/main/management-route-ids";

const mocks = vi.hoisted(() => ({
  getClassRoomData: vi.fn(),
}));

vi.mock("~/features/classRoom/application/class-room-options", () => ({
  getClassRoomData: mocks.getClassRoomData,
}));

const classRoom = {
  classRoomId: 12,
  classCode: "1A",
  className: "1年A組",
  studentCount: 2,
  teacher: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  mocks.getClassRoomData.mockReset();
});

function renderManagementRouter(
  routes: Parameters<typeof createMemoryRouter>[0],
  initialEntry: string
) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });
  render(<RouterProvider router={router} />);
  return router;
}

function TeacherParentDataProbe() {
  const data = useRouteLoaderData(managementRouteIds.teachers) as
    { total?: number } | undefined;
  return <output data-testid="teacher-parent-total">{data?.total}</output>;
}

describe("management route integration wiring", () => {
  it("Teacherのdirect newはmanagementRouteIdsとOutlet option contextを通る", async () => {
    mocks.getClassRoomData.mockResolvedValue([
      { ...classRoom, classRoomId: 1 },
    ]);
    vi.spyOn(TeacherApi, "getTeacherList").mockResolvedValue({
      items: [],
      limit: 50,
      offset: 0,
      total: 0,
    });

    const router = renderManagementRouter(
      [
        {
          id: managementRouteIds.teachers,
          path: "/teachers",
          loader: ({ request }) => teachersLoader({ request }),
          element: <TeachersRoute />,
          children: [
            {
              path: "new",
              element: (
                <>
                  <TeacherCreateRoute />
                  <TeacherParentDataProbe />
                </>
              ),
            },
          ],
        },
      ],
      "/teachers/new?search=keep&page=2"
    );

    expect(await screen.findByLabelText("先生名")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /1年A組/ })
    ).toBeInTheDocument();
    expect(screen.getByTestId("teacher-parent-total")).toHaveTextContent("0");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/teachers")
    );
    expect(router.state.location.search).toBe("?search=keep&page=2");
    expect(mocks.getClassRoomData).toHaveBeenCalledOnce();
  });

  it("ClassRoomのdirect editはsingle fetchし、teacher optionsをlist queryと分離する", async () => {
    vi.spyOn(ClassRoomApi, "getClassRoomList").mockResolvedValue({
      items: [],
      limit: 50,
      offset: 0,
      total: 0,
    });
    const getClassRoomById = vi
      .spyOn(ClassRoomApi, "getClassRoomById")
      .mockResolvedValue(classRoom);
    const getActiveTeachers = vi
      .spyOn(TeacherApi, "getActiveTeachers")
      .mockResolvedValue({
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

    renderManagementRouter(
      [
        {
          id: managementRouteIds.classrooms,
          path: "/classrooms",
          loader: ({ request }) => classRoomsLoader({ request }),
          element: <ClassRoomRoute />,
          children: [
            {
              path: ":classRoomId/edit",
              loader: ({ params }) => classRoomEditLoader({ params }),
              element: <ClassRoomEditRoute />,
            },
          ],
        },
      ],
      "/classrooms/12/edit?search=keep&sortBy=className"
    );

    expect(await screen.findByDisplayValue("1A")).toBeInTheDocument();
    expect(getClassRoomById).toHaveBeenCalledOnce();
    expect(getClassRoomById).toHaveBeenCalledWith(12);
    expect(getActiveTeachers).toHaveBeenCalledOnce();
  });

  it("Student list query変更は固定ClassRoom optionを再取得しない", async () => {
    mocks.getClassRoomData.mockResolvedValue([]);
    const getStudents = vi.spyOn(StudentApi, "getStudents").mockResolvedValue({
      items: [],
      limit: 50,
      offset: 0,
      total: 0,
    });

    const router = renderManagementRouter(
      [
        {
          id: managementRouteIds.students,
          path: "/students",
          loader: ({ request }) => studentsLoader({ request }),
          element: <StudentsRoute />,
        },
      ],
      "/students"
    );

    await waitFor(() => expect(getStudents).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.getClassRoomData).toHaveBeenCalledOnce());
    await router.navigate("/students?search=山田");
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
    expect(mocks.getClassRoomData).toHaveBeenCalledOnce();
  });
});
