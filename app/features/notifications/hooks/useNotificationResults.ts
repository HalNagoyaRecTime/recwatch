import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  NotificationScheduleQueryApi,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  defaultResultFilters,
  filterRecipients,
  type ResultFilters,
} from "~/features/notifications/model/notification-results";

type Options = {
  api: NotificationScheduleQueryApi;
  scheduleId: number | null;
  active: boolean;
  refreshKey: number;
};
type Snapshot = {
  scheduleId: number;
  items: NotificationScheduleResults["recipients"]["items"];
};
export function useNotificationResults({
  api,
  scheduleId,
  active,
  refreshKey,
}: Options) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<{
    scheduleId: number;
    message: string;
  } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selection, setSelection] = useState<{
    scheduleId: number | null;
    filters: ResultFilters;
    page: number;
  }>({ scheduleId: null, filters: defaultResultFilters, page: 1 });
  const sequence = useRef(0);
  const invalidateRequests = useCallback(() => {
    sequence.current++;
  }, []);
  const loadResults = useCallback(async () => {
    if (scheduleId === null) return;
    const request = ++sequence.current;
    setLoadingId(scheduleId);
    setError(null);
    try {
      const first = await api.getResults(scheduleId, { page: 1, limit: 100 });
      if (request !== sequence.current) return;
      const items = [...first.recipients.items];
      for (
        let page = 2;
        page <= first.recipients.pagination.totalPages;
        page += 4
      ) {
        if (request !== sequence.current) return;
        const pages = Array.from(
          {
            length: Math.min(
              4,
              first.recipients.pagination.totalPages - page + 1
            ),
          },
          (_, index) => page + index
        );
        const batch = await Promise.all(
          pages.map((page) => api.getResults(scheduleId, { page, limit: 100 }))
        );
        if (request !== sequence.current) return;
        for (const next of batch) items.push(...next.recipients.items);
      }
      const unique = [
        ...new Map(
          items.map((item) => [item.notificationRecipientId, item])
        ).values(),
      ];
      setSnapshot({ scheduleId, items: unique });
    } catch {
      if (request === sequence.current)
        setError({ scheduleId, message: "配信結果を読み込めませんでした。" });
    } finally {
      if (request === sequence.current) setLoadingId(null);
    }
  }, [api, scheduleId]);
  useEffect(() => {
    if (!active || scheduleId === null) return;
    let mounted = true;
    queueMicrotask(() => {
      if (mounted) void loadResults();
    });
    return () => {
      mounted = false;
      invalidateRequests();
    };
  }, [active, loadResults, refreshKey, scheduleId, invalidateRequests]);
  const data = snapshot?.scheduleId === scheduleId ? snapshot.items : null;
  const filters =
    selection.scheduleId === scheduleId
      ? selection.filters
      : defaultResultFilters;
  const filtered = useMemo(
    () => filterRecipients(data ?? [], filters),
    [data, filters]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 50));
  const page = Math.min(
    selection.scheduleId === scheduleId ? selection.page : 1,
    pageCount
  );
  return {
    data,
    items: filtered.slice((page - 1) * 50, page * 50),
    total: filtered.length,
    page,
    pageCount,
    filters,
    isLoading:
      active &&
      scheduleId !== null &&
      (loadingId === scheduleId || (!data && error?.scheduleId !== scheduleId)),
    errorMessage: error?.scheduleId === scheduleId ? error.message : null,
    loadResults,
    resetFilters: () =>
      setSelection({
        scheduleId: null,
        filters: defaultResultFilters,
        page: 1,
      }),
    onFiltersChange: (filters: ResultFilters) =>
      setSelection({ scheduleId, filters, page: 1 }),
    onPageChange: (page: number) =>
      setSelection({
        scheduleId,
        filters,
        page: Math.min(Math.max(1, page), pageCount),
      }),
  };
}
