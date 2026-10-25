/** 配信予定が存在し、すべて未開始のときだけ配信設定を編集できる。 */
export function canEditNotificationSchedule(
  schedules: readonly { status: string }[]
): boolean {
  return (
    schedules.length > 0 &&
    schedules.every((schedule) => schedule.status === "scheduled")
  );
}
