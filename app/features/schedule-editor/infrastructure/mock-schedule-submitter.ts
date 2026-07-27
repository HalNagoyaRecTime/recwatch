import type { ScheduleSubmitter } from "../application/schedule-submitter";

export const mockScheduleSubmitter: ScheduleSubmitter = {
  async submit() {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return { scheduleId: crypto.randomUUID() };
  },
};
