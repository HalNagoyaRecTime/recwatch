import { useState } from "react";
import { CalendarDays, Ellipsis, Grid2X2, List, Plus } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchCombobox } from "~/components/ui/form/SearchCombobox";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { Select } from "~/components/ui/form/Select";
import { NotificationsTable } from "~/features/notifications/components/NotificationsTable";
import { notificationListPageSize } from "~/features/notifications/model/notification-list-pagination";
import type { NotificationListItem } from "~/features/notifications/model/notification-list-item";
import type { NotificationListSort } from "~/features/notifications/model/notification-list-sort";
import { notificationSearchOptions } from "~/features/notifications/search/notification-search-options";

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
  { label: "自動", value: "automatic" },
  { label: "手動", value: "manual" },
  { label: "未実装", value: "unimplemented" },
] as const;

type NotificationDisplayMode =
  (typeof notificationDisplayOptions)[number]["value"];

export function NotificationListView({
  currentPage,
  items,
  onDelete,
  onPageChange,
  onSortChange,
  pageCount,
  sort,
  totalItems,
}: {
  currentPage: number;
  items: readonly NotificationListItem[];
  onDelete?: (item: NotificationListItem) => void;
  onPageChange: (page: number) => void;
  onSortChange: (columnId: string) => void;
  pageCount: number;
  sort?: NotificationListSort;
  totalItems: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] =
    useState<NotificationDisplayMode>("all");
  const [viewMode, setViewMode] = useState<NotificationViewMode>("list");

  return (
    <section className="mx-auto flex w-full flex-col gap-4">
      <PageHeader
        title="通知一覧"
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
          onOptionSelect={(option) => setSearchQuery(option.label)}
          onQueryChange={setSearchQuery}
          options={notificationSearchOptions}
          placeholder="通知を検索（未実装）"
          query={searchQuery}
        />
        <Select
          ariaLabel="通知の表示範囲"
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
        <Button
          icon={Ellipsis}
          iconOnly
          aria-label="その他の操作"
          variant="secondary"
          size="md"
        />
      </div>

      <NotificationsTable
        footer={
          pageCount > 1 ? (
            <Pagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              pageCount={pageCount}
              pageSize={notificationListPageSize}
              totalItems={totalItems}
            />
          ) : undefined
        }
        items={items}
        onDelete={onDelete}
        onSortChange={onSortChange}
        sort={sort}
      />
    </section>
  );
}
