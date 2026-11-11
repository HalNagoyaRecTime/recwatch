type EventGatheringContextProps = {
  endTime: string;
  name: string;
  startTime: string;
};

/** 集合設定中も対象の競技と時間枠を確認できるようにする。 */
export function EventGatheringContext({
  endTime,
  name,
  startTime,
}: EventGatheringContextProps) {
  return (
    <section
      aria-label="設定対象の競技"
      className="bg-surface-hover app-rounded flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-5"
    >
      <h3 className="text-text-base min-w-0 text-lg font-semibold break-words">
        {name}
      </h3>
      <dl className="sm:border-border-base flex min-w-0 items-baseline gap-2 sm:border-l sm:pl-5">
        <dt className="text-text-muted shrink-0 text-sm">競技時間</dt>
        <dd className="text-text-base text-sm font-semibold whitespace-nowrap tabular-nums">
          {startTime}〜{endTime}
        </dd>
      </dl>
    </section>
  );
}
