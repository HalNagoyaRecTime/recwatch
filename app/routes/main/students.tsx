import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";

import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { StudentApi } from "~/features/students/api";
import { loadStudentManagementPage } from "~/features/students/application/student-loaders";
import { StudentsPage } from "~/features/students/pages/StudentsPage";
import { userManagementApi } from "~/features/user-management/api";
import { createPageTitle } from "~/lib/page-title";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("学生管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const [page, classRooms] = await Promise.all([
    loadStudentManagementPage(new URL(request.url).searchParams, StudentApi),
    getClassRoomData(),
  ]);

  return {
    ...page,
    classRooms: classRooms.map(({ classRoomId, classCode, className }) => ({
      classRoomId,
      classCode,
      className,
    })),
  };
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

  return (
    <>
      <PageLayout>
        <PagePadding>
          <StudentsPage
            api={StudentApi}
            {...page}
            onRevalidate={() => revalidator.revalidate()}
            userApi={userManagementApi}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={closeModal} />
    </>
  );
}
