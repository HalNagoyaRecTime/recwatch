import { Clock3Icon } from "lucide-react";

import type { SchedulePublication } from "../model/schedule";

type SchedulePublicationLabelProps = {
  publication: SchedulePublication;
};

export function SchedulePublicationLabel({
  publication,
}: SchedulePublicationLabelProps) {
  if (publication.mode === "none") {
    return <span className="text-xs text-[color:var(--text-3)]">通知なし</span>;
  }

  if (publication.mode === "sent") {
    return (
      <span className="text-xs text-[color:var(--tone-green-text)]">
        配信済み
      </span>
    );
  }

  if (publication.mode === "sending") {
    return <span className="text-xs text-[color:var(--text-2)]">送信中</span>;
  }

  if (publication.mode === "failed") {
    return (
      <span className="text-xs text-[color:var(--tone-red-text)]">
        送信失敗
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold">
      <Clock3Icon size={13} aria-hidden="true" />
      {publication.publishAt}
    </span>
  );
}
