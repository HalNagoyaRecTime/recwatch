import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Link } from "react-router";

type ScheduleSearchToolbarProps = {
  query: string;
  resultCount: number;
  onQueryChange: (query: string) => void;
};

export function ScheduleSearchToolbar({
  query,
  resultCount,
  onQueryChange,
}: ScheduleSearchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <label className="flex h-10 w-full max-w-[360px] items-center gap-2 rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-3">
          <SearchIcon
            size={16}
            className="shrink-0 text-[color:var(--text-3)]"
            aria-hidden="true"
          />
          <span className="sr-only">スケジュールを検索</span>
          <input
            type="search"
            value={query}
            placeholder="種別・競技名・場所で検索"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--text-3)]"
            onChange={(event) => onQueryChange(event.currentTarget.value)}
          />
          {query ? (
            <button
              type="button"
              aria-label="検索条件をクリア"
              title="検索条件をクリア"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--text-3)] hover:bg-[color:var(--surface-2)]"
              onClick={() => onQueryChange("")}
            >
              <XIcon size={14} aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <span className="shrink-0 text-xs text-[color:var(--text-3)]">
          {resultCount}件
        </span>
      </div>

      <Link
        to="/schedule/new"
        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[color:var(--brand-button-1)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-button-2)]"
      >
        <PlusIcon size={15} aria-hidden="true" />
        新規登録
      </Link>
    </div>
  );
}
