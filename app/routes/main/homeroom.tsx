// import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
// import { pageContent } from "~/features/admin-pages/model/page-content";

import { HomeRoomPage } from "~/features/homeroom/pages/HomeRoomPage";
import type { Homeroom } from "~/features/homeroom/model/homeroom";

export function meta() {
  return [{ title: "Homeroom | recwatch" }];
}

export default function HomeroomRoute() {
  return <HomeRoomPage homerooms={Homeroom} />;
}

const Homeroom: Homeroom[] = [
  {
    HomeRoomId: 1,
    HomeRoomCode: "11A",
    HomeRoomName: "1年Aクラス",
  },
  {
    HomeRoomId: 2,
    HomeRoomCode: "11B",
    HomeRoomName: "1年Bクラス",
  },
  {
    HomeRoomId: 3,
    HomeRoomCode: "12A",
    HomeRoomName: "2年Aクラス",
  },
];

// クラス名 SQL likeを使用して絞り込みを実装する
