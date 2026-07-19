import { HomeroomPage } from "~/features/homeroom/pages/HomeRoomPage";

export function meta() {
  return [{ title: "クラス管理 | recwatch" }];
}

export default function HomeroomRoute() {
  return <HomeroomPage />;
}
