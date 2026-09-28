import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import { loadClassRoomListPage } from "~/features/classRoom/application/class-room-loaders";
import { parseClassRoomListUrl } from "~/features/classRoom/application/class-room-list-url";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { TeacherApi } from "~/features/teachers/api";
import { createPageTitle } from "~/lib/page-title";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

const CLASS_ROOM_LIST_LIMIT = 50;

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const { page, search, sortBy, sortOrder } =
    parseClassRoomListUrl(searchParams);
  const [classRoomPage, activeTeachers] = await Promise.all([
    loadClassRoomListPage(ClassRoomApi, {
      limit: CLASS_ROOM_LIST_LIMIT,
      offset: (page - 1) * CLASS_ROOM_LIST_LIMIT,
      search: search || undefined,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
    }),
    TeacherApi.getActiveTeachers(),
  ]);

  return {
    items: classRoomPage.items,
    limit: classRoomPage.limit,
    offset: classRoomPage.offset,
    teacherOptions: activeTeachers.items.map(({ displayName, teacherId }) => ({
      displayName,
      teacherId,
    })),
    total: classRoomPage.total,
  };
}

export function meta() {
  return [{ title: createPageTitle("クラス管理") }];
}

export function ErrorBoundary() {
  const message = getManagementRouteErrorMessage(useRouteError());
  return (
    <PageLayout>
      <PagePadding>
        <div role="alert" className="text-tone-danger-text p-6">
          {message}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

export default function ClassRoomRoute() {
  const page = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const closeModal = useManagementModalNavigation("/classrooms");

  return (
    <>
      <PageLayout>
        <PagePadding>
          <ClassRoomPage
            api={ClassRoomApi}
            items={page.items}
            limit={page.limit}
            offset={page.offset}
            onRevalidate={() => revalidator.revalidate()}
            total={page.total}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={closeModal} />
    </>
  );
}
