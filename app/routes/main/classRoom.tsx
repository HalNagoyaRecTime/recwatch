import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
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
    <div role="alert" className="p-6 text-red-500">
      {message}
    </div>
  );
}

export default function ClassRoomRoute() {
  const { classRooms } = useLoaderData<typeof clientLoader>();
  return <ClassRoomPage classRooms={classRooms} />;
}
