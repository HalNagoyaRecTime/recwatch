import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";
import { useCallback } from "react";

import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { StudentApi } from "~/features/students/api";
import { loadStudentManagementPage } from "~/features/students/application/student-loaders";
import { StudentsPage } from "~/features/students/pages/StudentsPage";
import { userManagementApi } from "~/features/user-management/api";
import { useManagementOptions } from "~/hooks/useManagementOptions";
import { createPageTitle } from "~/lib/page-title";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("学生管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  return loadStudentManagementPage(
    new URL(request.url).searchParams,
    StudentApi
  );
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

export default function StudentsRoute() {
  const page = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const closeModal = useManagementModalNavigation("/students");
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
          <StudentsPage
            api={StudentApi}
            classRoomOptions={classRoomOptions}
            classRooms={classRoomOptions.items}
            {...page}
            onRevalidate={() => revalidator.revalidate()}
            userApi={userManagementApi}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={{ closeModal, options: classRoomOptions }} />
    </>
  );
}
