import { httpScheduleManagementGateway } from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { ScheduleManagementPage } from "~/features/schedule-management/pages/ScheduleManagementPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "スケジュール管理 | recwatch" }];
}

export default function ScheduleRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <ScheduleManagementPage gateway={httpScheduleManagementGateway} />
      </PagePadding>
    </PageLayout>
  );
}
