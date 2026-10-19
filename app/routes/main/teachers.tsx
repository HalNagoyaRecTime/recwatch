import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";
import { useCallback } from "react";
import { createPageTitle } from "~/lib/page-title";
import { parseTeacherListUrl } from "~/features/teachers/application/teacher-list-url";
import { loadTeacherListPage } from "~/features/teachers/application/teacher-loaders";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";
import { TeacherApi } from "~/features/teachers/api";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import { useManagementOptions } from "~/hooks/useManagementOptions";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

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
  return loadTeacherListPage(
    {
      limit,
      offset: (page - 1) * limit,
      search: search || undefined,
      classRoomId: classRoomId ?? undefined,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
      isStaff,
      isLiveActive,
    },
    TeacherApi
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = getManagementRouteErrorMessage(error);
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

export default function TeachersRoute() {
  const { limit, offset, teachers, total } =
    useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const closeModal = useManagementModalNavigation("/teachers");
  const loadClassRoomOptions = useCallback(async () => {
    const classRooms = await getClassRoomData();
    return classRooms.map(({ classRoomId, classCode, className }) => ({
      classRoomId,
      classCode,
      className,
    }));
  }, []);
  const classRoomOptions = useManagementOptions(
    loadClassRoomOptions,
    "クラス候補を取得できませんでした。"
  );
  return (
    <>
      <PageLayout>
        <PagePadding>
          <TeachersPage
            api={TeacherApi}
            classRoomOptions={classRoomOptions}
            classRooms={classRoomOptions.items}
            limit={limit}
            offset={offset}
            onRevalidate={() => revalidator.revalidate()}
            teachers={teachers}
            total={total}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={{ closeModal, options: classRoomOptions }} />
    </>
  );
}
