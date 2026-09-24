import { Info } from "lucide-react";

import type { EventDetail } from "~/features/sports/model/event-detail";

type EventBasicInfoCardProps = {
  event: EventDetail;
};

/** Event 詳細の基本情報。編集はせず、登録済みの値を項目ごとに並べて見せる。 */
export function EventBasicInfoCard({ event }: EventBasicInfoCardProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "イベント名", value: event.name },
    { label: "開催場所", value: event.venue },
    { label: "開始時間", value: event.startTime },
    { label: "終了時間", value: event.endTime },
    { label: "ルール・備考", value: event.rules ?? "未設定" },
  ];

  return (
    <section
      aria-labelledby="event-basic-info-heading"
      className="border-border-base app-rounded space-y-4 border p-5"
    >
      <h2
        className="text-text-base flex items-center gap-2 text-base font-semibold"
        id="event-basic-info-heading"
      >
        <Info aria-hidden="true" className="text-brand-primary size-4" />
        基本情報
      </h2>
      <dl className="divide-border-subtle divide-y">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-text-muted text-sm">{row.label}</dt>
            <dd className="text-text-base text-sm break-words whitespace-pre-wrap">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
