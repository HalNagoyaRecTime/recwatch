import {
  httpEventNotificationGateway,
  httpScheduleManagementGateway,
} from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { EventTimeRegistrationPage } from "~/features/schedule-management/pages/EventTimeRegistrationPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "イベント時間登録 | REC TIME" }];
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
