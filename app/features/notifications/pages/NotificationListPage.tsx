import { CalendarDays, Grid2X2, List, Plus } from "lucide-react";
import { useState } from "react";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import {
  SearchCombobox,
  type SearchOption,
} from "~/components/ui/form/SearchCombobox";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { NotificationsTable } from "~/features/notifications/components/list/NotificationsTable";
import type { NotificationListItem } from "~/features/notifications/model/notification-list";
import {
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list";
import { notificationDesignListItems } from "~/features/notifications/model/notification-design-data";

const notificationViewOptions = [
  {
    icon: CalendarDays,
    label: "カレンダー表示",
    value: "calendar",
  },
  {
    icon: Grid2X2,
    label: "グリッド表示",
    value: "grid",
  },
  {
    icon: List,
    label: "リスト表示",
    value: "list",
  },
] as const;

type NotificationViewMode = (typeof notificationViewOptions)[number]["value"];

const notificationDisplayOptions = [
  { label: "すべて表示", value: "all" },
  { label: "自動（未実装）", value: "automatic" },
  { label: "手動（未実装）", value: "manual" },
] as const;

type NotificationDisplayMode =
  (typeof notificationDisplayOptions)[number]["value"];

const notificationSearchOptions: readonly SearchOption[] = [];

export function NotificationListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] =
    useState<NotificationDisplayMode>("all");
  const [viewMode, setViewMode] = useState<NotificationViewMode>("list");
  const [sort, setSort] = useState<NotificationListSort>();
  const items = sortItems(notificationDesignListItems, sort);

  function handleSortChange(columnId: string) {
    if (isNotificationSortableColumnId(columnId)) {
      setSort((current) => getNextNotificationListSort(current, columnId));
    }
  }

  return (
    <>
      <section className="mx-auto flex w-full flex-col gap-4">
        <PageHeader
          title="通知管理"
          description="配信済み通知の一覧と配信状況を確認できます"
          actions={
            <ButtonLink
              icon={Plus}
              to="/notifications/new"
              variant="primary"
              size="lg"
            >
              通知を作成
            </ButtonLink>
          }
        />

        <div className="flex gap-3">
          <SearchCombobox
            ariaLabel="通知を検索（未実装）"
            emptyMessage="通知検索は未実装です"
            onOptionSelect={(option) => setSearchQuery(option.label)}
            onQueryChange={setSearchQuery}
            options={notificationSearchOptions}
            placeholder="通知を検索（未実装）"
            query={searchQuery}
          />
          <Select
            ariaLabel="通知の表示範囲（自動・手動は未実装）"
            onValueChange={setDisplayMode}
            options={notificationDisplayOptions}
            value={displayMode}
          />
          <SegmentedControl
            ariaLabel="表示形式"
            behavior="selection"
            onValueChange={setViewMode}
            options={notificationViewOptions}
            value={viewMode}
          />
        </div>

        {viewMode === "list" ? (
          <NotificationsTable
            items={items}
            onSortChange={handleSortChange}
            sort={sort}
          />
        ) : (
          <div
            aria-label="通知の表示形式（未実装）"
            className="text-text-muted flex min-h-60 items-center justify-center text-lg"
            role="status"
          >
            未実装
          </div>
        )}
      </section>
    </>
  );
}

function sortItems(
  items: readonly NotificationListItem[],
  sort: NotificationListSort | undefined
) {
  if (!sort) {
    return items;
  }

  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });

  return [...items].sort((left, right) => {
    const result = collator.compare(left[sort.columnId], right[sort.columnId]);
    return sort.direction === "asc" ? result : -result;
  });
}
