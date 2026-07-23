import { ScheduleCreatePage } from "~/features/schedule/pages/ScheduleCreatePage";

export function meta() {
  return [{ title: "スケジュール 新規登録 | recwatch" }];
}

export default function ScheduleCreateRoute() {
  return <ScheduleCreatePage />;
}
