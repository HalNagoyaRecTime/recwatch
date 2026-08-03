import { useParams } from "react-router";

import { createEventScheduleUpdater } from "~/features/schedule-management/application/create-event-schedule-updater";
import {
  httpEventNotificationGateway,
  httpScheduleManagementGateway,
} from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { ScheduleEditEntryPage } from "~/features/schedule-management/pages/ScheduleEditEntryPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "イベント編集 | REC TIME" }];
}

export default function ScheduleEditRoute() {
  const { scheduleId } = useParams();

  if (!scheduleId) {
    return null;
  }

  return (
    <PageLayout>
      <PagePadding>
        <ScheduleEditEntryPage
          scheduleId={scheduleId}
          gateway={httpScheduleManagementGateway}
          createSubmitter={(schedule) =>
            createEventScheduleUpdater(schedule, httpEventNotificationGateway)
          }
        />
      </PagePadding>
    </PageLayout>
  );
}
