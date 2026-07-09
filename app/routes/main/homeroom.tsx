import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { HomeroomPage } from "~/features/homeroom/pages/HomeRoomPage";
import { getHomeroomData } from "~/features/homeroom/model/homeroom-data";

export async function loader() {
  return getHomeroomData();
}

export function HydrateFallback() {
  return <div className="p-6 text-gray-500">読み込み中...</div>;
}

export function meta() {
  return [{ title: "Homeroom | recwatch" }];
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "予期しないエラーが発生しました。";
  if (isRouteErrorResponse(error)) {
    if (error.status === 401)
      message = "認証が必要です。再ログインしてください。";
    else message = `エラー${error.status}:${error.data || error.statusText} `;
  }
  return <div className="p-6 text-red-500">{message}</div>;
}

export default function HomeroomRoute() {
  const Homerooms = useLoaderData<typeof loader>();
  return <HomeroomPage homerooms={Homerooms} />;
}
