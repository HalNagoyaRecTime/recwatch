import { AdminScreenPage } from "~/features/admin-pages/components/AdminScreenPage";
import { dashboardContent } from "~/features/admin-pages/model/dashboard-content";

export function meta() {
  return [{ title: "Dashboard | recwatch" }];
}

export default function DashboardRoute() {
  return <AdminScreenPage {...dashboardContent} />;
}
