import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { SchedulePage } from "~/features/schedule/pages/SchedulePage";
import { getScheduleData } from "~/features/schedule/model/schedule-data";

export async function clientLoader() {
  return getScheduleData();
}

export function meta() {
  return [{ title: "スケジュール | recwatch" }];
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
    <div className="p-6 text-red-500">
      {message}
      <br />
      スケジュールデータの取得に失敗しました。バックエンドが起動しているか確認してください。
    </div>
  );
}

export default function ScheduleRoute() {
  const schedules = useLoaderData<typeof clientLoader>();
  return <SchedulePage schedules={schedules} />;
}
