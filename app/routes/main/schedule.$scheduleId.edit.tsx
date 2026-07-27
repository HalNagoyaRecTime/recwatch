import { useParams } from "react-router";

import { createMockScheduleUpdater } from "~/features/schedule-management/infrastructure/create-mock-schedule-updater";
import { mockScheduleManagementGateway } from "~/features/schedule-management/infrastructure/mock-schedule-management-gateway";
import { ScheduleEditEntryPage } from "~/features/schedule-management/pages/ScheduleEditEntryPage";
import { mockScheduleFormOptions } from "~/features/schedule-editor/infrastructure/mock-schedule-form-options";

export function meta() {
  return [{ title: "スケジュール編集 | REC TIME" }];
}

export default function ScheduleEditRoute() {
  const { scheduleId } = useParams();

  if (!scheduleId) {
    return null;
  }

  return (
    <ScheduleEditEntryPage
      scheduleId={scheduleId}
      gateway={mockScheduleManagementGateway}
      submitter={createMockScheduleUpdater(scheduleId, mockScheduleFormOptions)}
      options={mockScheduleFormOptions}
    />
  );
}
