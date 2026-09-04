import { createPageTitle } from "~/lib/page-title";
import { httpScheduleManagementGateway } from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { ScheduleManagementPage } from "~/features/schedule-management/pages/ScheduleManagementPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("スケジュール管理") }];
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
