import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";

export async function clientLoader() {
  return { classRooms: await getClassRoomData() };
}

export function meta() {
  return [{ title: "ユーザー管理（クラス） | recwatch" }];
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
        <div className="p-6 text-red-500">{message}</div>
      </PagePadding>
    </PageLayout>
  );
}

export default function ClassRoomRoute() {
  const { classRooms } = useLoaderData<typeof clientLoader>();
  return (
    <PageLayout>
      <PagePadding>
        <ClassRoomPage classRooms={classRooms} />
      </PagePadding>
    </PageLayout>
  );
}
