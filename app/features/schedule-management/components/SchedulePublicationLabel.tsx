import { Clock3Icon } from "lucide-react";

import type { SchedulePublication } from "../model/schedule";

type SchedulePublicationLabelProps = {
  publication: SchedulePublication;
};

export function SchedulePublicationLabel({
  publication,
}: SchedulePublicationLabelProps) {
  if (publication.mode === "none") {
    return <span className="text-text-subtle text-xs">通知なし</span>;
  }

  if (publication.mode === "sent") {
    return <span className="text-tone-success-text text-xs">配信済み</span>;
  }

  if (publication.mode === "sending") {
    return <span className="text-text-muted text-xs">送信中</span>;
  }

  if (publication.mode === "failed") {
    return <span className="text-tone-danger-text text-xs">送信失敗</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold">
      <Clock3Icon size={13} aria-hidden="true" />
      {publication.publishAt}
    </span>
  );
}
