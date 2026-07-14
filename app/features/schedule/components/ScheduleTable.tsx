import type { Schedule } from "~/features/schedule/model/schedule";
import type { ScheduleType } from "~/features/schedule/api";

const scheduleTypeLabel: Record<ScheduleType, string> = {
  ceremony: "式典",
  competition: "競技",
  break: "休憩",
  other: "その他",
};

export function ScheduleTable({ schedules }: { schedules: Schedule[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-1)]">
      <table className="w-full text-sm text-[var(--text-1)]">
        <thead className="border-b border-b-[var(--border-2)] bg-[var(--surface-2)] text-left text-xs">
          <tr>
            <th className="px-4 py-3">順番</th>
            <th className="px-4 py-3">種別</th>
            <th className="px-4 py-3">名称</th>
            <th className="px-4 py-3">開始</th>
            <th className="px-4 py-3">終了</th>
            <th className="px-4 py-3">場所</th>
            <th className="px-4 py-3">説明</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface-1)]">
          {schedules.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-[var(--text-2)]"
              >
                スケジュールデータがありません
              </td>
            </tr>
          ) : (
            schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-t border-t-[var(--border-1)] hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-3">{schedule.order}</td>
                <td className="px-4 py-3">
                  {scheduleTypeLabel[schedule.type]}
                </td>
                <td className="px-4 py-3">{schedule.name}</td>
                <td className="px-4 py-3">{schedule.startTime}</td>
                <td className="px-4 py-3">{schedule.endTime}</td>
                <td className="px-4 py-3">{schedule.location ?? "-"}</td>
                <td className="px-4 py-3">{schedule.description ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
