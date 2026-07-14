import type { Schedule } from "~/features/schedule/model/schedule";
import { ScheduleTable } from "~/features/schedule/components/ScheduleTable";

export function SchedulePage({ schedules }: { schedules: Schedule[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-[var(--text-1)]">スケジュール</h1>
      <ScheduleTable schedules={schedules} />
    </div>
  );
}
