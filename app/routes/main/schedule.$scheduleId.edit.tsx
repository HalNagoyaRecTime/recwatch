import { useParams } from "react-router";

import { createEventScheduleUpdater } from "~/features/schedule-management/application/create-event-schedule-updater";
import {
  httpEventNotificationGateway,
  httpScheduleManagementGateway,
} from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { ScheduleEditEntryPage } from "~/features/schedule-management/pages/ScheduleEditEntryPage";

export function meta() {
  return [{ title: "イベント編集 | REC TIME" }];
}

export default function ScheduleEditRoute() {
  const { scheduleId } = useParams();

  if (!scheduleId) {
    return null;
  }

  return (
    <ScheduleEditEntryPage
      scheduleId={scheduleId}
      gateway={httpScheduleManagementGateway}
      createSubmitter={(schedule) =>
        createEventScheduleUpdater(schedule, httpEventNotificationGateway)
      }
    />
  );
}
