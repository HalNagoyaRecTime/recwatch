import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";

import { loadClassRoomListPage } from "~/features/classRoom/application/class-room-loaders";
import { parseClassRoomListUrl } from "~/features/classRoom/application/class-room-list-url";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { TeacherApi } from "~/features/teachers/api";
import { createPageTitle } from "~/lib/page-title";

const CLASS_ROOM_LIST_LIMIT = 50;

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const { page, search, sortBy, sortOrder } =
    parseClassRoomListUrl(searchParams);
  const [classRoomPage, teachers] = await Promise.all([
    loadClassRoomListPage({
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
    teacherOptions: teachers.items.map((teacher) => ({
      teacherId: teacher.teacher_id,
      displayName: teacher.display_name,
    })),
    total: classRoomPage.total,
  };
}

export function meta() {
  return [{ title: createPageTitle("クラス管理") }];
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "予期しないエラーが発生しました。";
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      message = "認証が必要です。再ログインしてください。";
    } else {
      message = `エラー${error.status}:${error.data || error.statusText}`;
    }
  }
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

  return (
    <>
      <PageLayout>
        <PagePadding>
          <ClassRoomPage
            {...page}
            onRevalidate={() => revalidator.revalidate()}
          />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
