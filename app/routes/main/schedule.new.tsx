import { createPageTitle } from "~/lib/page-title";
import {
  httpEventNotificationGateway,
  httpScheduleManagementGateway,
} from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { EventTimeRegistrationPage } from "~/features/schedule-management/pages/EventTimeRegistrationPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("スケジュールの新規登録") }];
}

export default function ScheduleCreateRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <EventTimeRegistrationPage
          gateway={httpScheduleManagementGateway}
          eventNotificationGateway={httpEventNotificationGateway}
        />
      </PagePadding>
    </PageLayout>
  );
}
