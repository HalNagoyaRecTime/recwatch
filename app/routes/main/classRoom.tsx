import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { createPageTitle } from "~/config/app";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeacherApi } from "~/features/teachers/api";

export async function clientLoader() {
  const [classRooms, teachers] = await Promise.all([
    getClassRoomData(),
    TeacherApi.getTeachers(),
  ]);
  return {
    classRooms,
    teacherOptions: teachers.items.map((teacher) => ({
      teacherId: teacher.teacher_id,
      displayName: teacher.display_name,
    })),
  };
}

export function meta() {
  return [{ title: createPageTitle("クラス管理") }];
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "予期しないエラーが発生しました。";
  if (isRouteErrorResponse(error)) {
    if (error.status === 401)
      message = "認証が必要です。再ログインしてください。";
    else message = `エラー${error.status}:${error.data || error.statusText} `;
  }
  return (
    <PageLayout>
      <PagePadding>
        <div role="alert" className="p-6 text-red-500">
          {message}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

export default function ClassRoomRoute() {
  const { classRooms, teacherOptions } = useLoaderData<typeof clientLoader>();
  return (
    <PageLayout>
      <PagePadding>
        <ClassRoomPage
          classRooms={classRooms}
          teacherOptions={teacherOptions}
        />
      </PagePadding>
    </PageLayout>
  );
}
