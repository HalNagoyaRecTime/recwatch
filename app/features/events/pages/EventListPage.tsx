import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { getErrorMessage } from "~/lib/client-error";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { EventListGateway } from "~/features/events/api/event-list-gateway";
import { httpEventListGateway } from "~/features/events/api/http-event-list-gateway";
import { EventTable } from "~/features/events/components/EventTable";
import type { EventListItem } from "~/features/events/model/event-list-item";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

type EventListPageProps = {
  gateway?: EventListGateway;
};

/** 子ルート（イベント新規作成モーダル）から一覧の再取得を依頼するための受け渡し口。 */
export type EventListOutletContext = {
  reload: () => void;
};

export function EventListPage({
  gateway = httpEventListGateway,
}: EventListPageProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DataTableSort>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const outletContext = useMemo<EventListOutletContext>(
    () => ({ reload }),
    [reload]
  );

  useEffect(() => {
    let isCurrent = true;

    gateway
      .load()
      .then((items) => {
        if (!isCurrent) return;
        setEvents(items);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(
          getErrorMessage(error, "イベント一覧を取得できませんでした。")
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [gateway, reloadToken]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return events;

    return events.filter((event) =>
      [event.name, event.code, ...event.venues.map((venue) => venue.name)].some(
        (value) => value.toLocaleLowerCase("ja").includes(normalizedQuery)
      )
    );
  }, [events, query]);

  const visibleEvents = useMemo(
    () =>
      sortManagementTableItems(filteredEvents, sort, (event, columnId) => {
        switch (columnId) {
          case "event-id":
            return event.code;
          case "event-name":
            return event.name;
          case "venue":
            return event.venues[0]?.name;
          case "event-time":
            return `${event.startTime}-${event.endTime}`;
          case "gathering":
            return event.gatheringSummary.firstGatheringTime;
          default:
            return null;
        }
      }),
    [filteredEvents, sort]
  );

  async function deleteEvent(event: EventListItem) {
    if (
      isDeleting ||
      !window.confirm(`「${event.name}」を削除します。よろしいですか？`)
    ) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    try {
      await gateway.delete(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (error) {
      setActionError(
        getErrorMessage(error, "イベントを削除できませんでした。")
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <div className="space-y-1">
        <p className="text-text-muted text-xs font-medium">イベント管理</p>
        <PageHeader
          actions={
            <ButtonLink
              icon={Plus}
              size="lg"
              to="/events/new"
              variant="primary"
            >
              新規登録
            </ButtonLink>
          }
          title="イベント一覧"
        />
      </div>

      {loadError || actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError ?? actionError}
        </p>
      ) : null}

      <SearchField
        ariaLabel="イベントを検索"
        onValueChange={setQuery}
        placeholder="イベント名・実施場所・IDで検索"
        value={query}
      />

      <EventTable
        emptyMessage={
          isLoading
            ? "イベントを読み込んでいます..."
            : query
              ? "検索条件に一致するイベントが見つかりません。"
              : "登録済みのイベントはありません。"
        }
        isMutating={isDeleting}
        items={visibleEvents}
        onDelete={(event) => void deleteEvent(event)}
        onOpenDetail={(event) => navigate(`/events/${event.id}`)}
        onSortChange={(columnId) =>
          setSort((current) => getNextManagementTableSort(current, columnId))
        }
        sort={sort}
      />

      <Outlet context={outletContext} />
    </div>
  );
}
