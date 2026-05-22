import { useLoaderData } from "react-router";

import { env } from "~/config/env";
import { AdminScreenPage } from "~/features/admin-pages/components/AdminScreenPage";
import { dashboardContent } from "~/features/admin-pages/model/dashboard-content";

export function meta() {
  return [{ title: "Dashboard | recwatch" }];
}

export async function loader() {
  const res = await fetch(`${env.backendBaseUrl}/`);
  return res.json();
}

export default function DashboardRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-[18px]">
      <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      <AdminScreenPage {...dashboardContent} />
    </div>
  );
}
