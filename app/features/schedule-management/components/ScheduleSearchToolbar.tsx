import { Plus } from "lucide-react";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SearchField } from "~/components/ui/form/SearchField";

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
        <div className="w-full max-w-90">
          <SearchField
            ariaLabel="イベントを検索"
            onValueChange={onQueryChange}
            placeholder="イベント名・開催場所で検索"
            value={query}
          />
        </div>
        <span className="text-text-muted shrink-0 text-xs">
          {resultCount}件
        </span>
      </div>

      <ButtonLink icon={Plus} to="/schedule/new" variant="primary">
        新規登録
      </ButtonLink>
    </div>
  );
}
