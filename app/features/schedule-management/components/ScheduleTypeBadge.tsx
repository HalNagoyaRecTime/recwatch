import {
  managedScheduleTypeLabels,
  type ManagedScheduleType,
} from "../model/schedule";

const badgeStyles: Record<ManagedScheduleType, string> = {
  opening: "bg-blue-50 text-blue-700",
  competition: "bg-amber-50 text-amber-700",
  gathering: "bg-orange-50 text-orange-700",
  lunch: "bg-emerald-50 text-emerald-700",
  closing: "bg-blue-50 text-blue-700",
};

type ScheduleTypeBadgeProps = {
  type: ManagedScheduleType;
};

export function ScheduleTypeBadge({ type }: ScheduleTypeBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeStyles[type]}`}
    >
      {managedScheduleTypeLabels[type]}
    </span>
  );
}
