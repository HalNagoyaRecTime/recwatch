import { ParticipantsPage } from "~/features/participants/pages/ParticipantsPage";

export function meta() {
  return [{ title: "出場メンバー管理 | recwatch" }];
}

export default function ParticipantsRoute() {
  return <ParticipantsPage />;
}
