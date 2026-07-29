import { mockScheduleFormOptions } from "~/features/schedule-editor/infrastructure/mock-schedule-form-options";
import { mockScheduleSubmitter } from "~/features/schedule-editor/infrastructure/mock-schedule-submitter";
import { ScheduleEditorPage } from "~/features/schedule-editor/pages/ScheduleEditorPage";

export function meta() {
  return [{ title: "スケジュール新規登録 | REC TIME" }];
}

export default function ScheduleCreateRoute() {
  return (
    <ScheduleEditorPage
      submitter={mockScheduleSubmitter}
      options={mockScheduleFormOptions}
    />
  );
}
