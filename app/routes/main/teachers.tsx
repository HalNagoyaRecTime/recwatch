import { Outlet, useLoaderData } from "react-router";
import { createPageTitle } from "~/lib/page-title";
import { parseTeacherListUrl } from "~/features/teachers/application/teacher-list-url";
import { loadTeacherListPage } from "~/features/teachers/application/teacher-loaders";
import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("教官管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const limit = 50;
  const {
    page,
    search,
    classRoomId,
    sortBy,
    sortOrder,
    isStaff,
    isLiveActive,
  } = parseTeacherListUrl(searchParams);
  const [teacherPage, classRooms] = await Promise.all([
    loadTeacherListPage({
      limit,
      offset: (page - 1) * limit,
      search: search || undefined,
      classRoomId: classRoomId ?? undefined,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
      isStaff,
      isLiveActive,
    }),
    getClassRoomData(),
  ]);
  return {
    ...teacherPage,
    classRooms: classRooms.map((classRoom) => ({
      classRoomId: classRoom.classRoomId,
      classCode: classRoom.classCode,
      className: classRoom.className,
    })),
  };
}

export default function TeachersRoute() {
  const { limit, offset, teachers, total, classRooms } =
    useLoaderData<typeof clientLoader>();
  return (
    <>
      <PageLayout>
        <PagePadding>
          <TeachersPage
            limit={limit}
            offset={offset}
            teachers={teachers}
            total={total}
            classRooms={classRooms}
          />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
