import { ScheduleListPage } from "~/features/schedule/pages/ScheduleListPage";

export function meta() {
  return [{ title: "スケジュール管理 | recwatch" }];
}

export default function ScheduleRoute() {
  return <ScheduleListPage />;
}
