import type { ScheduleDraft } from "../model/schedule-draft";

export type ScheduleSubmission = {
  scheduleId: string;
};

export interface ScheduleSubmitter {
  submit(draft: ScheduleDraft): Promise<ScheduleSubmission>;
}
