import { Clock3Icon } from "lucide-react";

import type { SchedulePublication } from "../model/schedule";

type SchedulePublicationLabelProps = {
  publication: SchedulePublication;
};

export function SchedulePublicationLabel({
  publication,
}: SchedulePublicationLabelProps) {
  if (publication.mode === "immediate") {
    return <span className="text-xs text-[color:var(--text-3)]">即時公開</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold">
      <Clock3Icon size={13} aria-hidden="true" />
      {publication.publishAt}
    </span>
  );
}
