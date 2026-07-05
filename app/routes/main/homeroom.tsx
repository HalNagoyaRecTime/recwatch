import { useLoaderData } from "react-router";
import { HomeRoomPage } from "~/features/homeroom/pages/HomeRoomPage";
import { getHomeRoomData } from "~/features/homeroom/model/homeroom-data";

export async function loader() {
  return getHomeRoomData();
}

export function meta() {
  return [{ title: "Homeroom | recwatch" }];
}

export function ErrorBoundary() {
  return (
    <div className="p-6 text-red-500">
      クラスデータの取得に失敗しました。バックエンドが起動しているか確認してください。
    </div>
  );
}

export default function HomeroomRoute() {
  const Homerooms = useLoaderData<typeof loader>();
  return <HomeRoomPage homerooms={Homerooms} />;
}

// クラス名 SQL likeを使用して絞り込みを実装する
