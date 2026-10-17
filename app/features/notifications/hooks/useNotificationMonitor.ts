import { useCallback, useEffect, useRef, useState } from "react";

import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  reportNotificationBackgroundError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import {
  getMonitorSchedule,
  getMonitorWindow,
  isMonitorScheduleVisible,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";

const currentTime = () => Date.now();

type MonitorState = {
  items: MonitorSchedule[];
  isLoading: boolean;
  hasLoaded: boolean;
  errorMessage: string | null;
  updatedAt: number | null;
};

type Options = {
  api: NotificationScheduleQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
  now?: () => number;
  refreshIntervalMs?: number;
};

export function useNotificationMonitor({
  api,
  reportFeedback,
  now = currentTime,
  refreshIntervalMs = 30_000,
}: Options) {
  const [state, setState] = useState<MonitorState>({
    items: [],
    isLoading: true,
    hasLoaded: false,
    errorMessage: null,
    updatedAt: null,
  });
  const generation = useRef(0);
  const loading = useRef(false);
  const reportedFailure = useRef(false);
  const [selectedScheduleId, selectSchedule] = useState<number | null>(null);

  const load = useCallback(
    async (background = false) => {
      if (loading.current) return;
      loading.current = true;
      const requestId = ++generation.current;
      setState((previous) => ({
        ...previous,
        isLoading: true,
        errorMessage: null,
      }));
      try {
        const at = now();
        const range = getMonitorWindow(at);
        // 期間未指定ではJST当日だけになるため、前後24時間を明示します。
        const response = await api.list({
          from: new Date(range.from).toISOString(),
          to: new Date(range.to).toISOString(),
        });
        if (generation.current !== requestId) return;
        const summaries = response.items.filter((item) =>
          isMonitorScheduleVisible(item, at)
        );
        const items: MonitorSchedule[] = new Array(summaries.length);
        let next = 0;
        const failures: unknown[] = [];
        const worker = async () => {
          while (next < summaries.length && generation.current === requestId) {
            const index = next++;
            const summary = summaries[index];
            try {
              const detail = await api.getDetail(
                summary.notificationScheduleId
              );
              items[index] = { summary, detail, errorMessage: null };
            } catch (error) {
              failures.push(error);
              items[index] = {
                summary,
                detail: null,
                errorMessage: "配信集計を読み込めませんでした。",
              };
            }
          }
        };
        // 詳細取得の同時実行数を制限します。
        await Promise.all(
          Array.from({ length: Math.min(4, summaries.length) }, worker)
        );
        if (generation.current !== requestId) return;
        const visibleItems = items.filter((item) =>
          isMonitorScheduleVisible(getMonitorSchedule(item), at)
        );
        setState({
          items: visibleItems,
          isLoading: false,
          hasLoaded: true,
          errorMessage: null,
          updatedAt: at,
        });
        if (background && failures.length > 0 && !reportedFailure.current) {
          reportedFailure.current = true;
          reportNotificationBackgroundError(reportFeedback, {
            title: "配信集計を更新できませんでした",
            message:
              "一部の配信集計を取得できませんでした。再読み込みしてください。",
            action: "notification.monitor.refresh",
            endpoint: "/api/v1/admin/notifications/schedules",
            error: failures[0],
          });
        } else if (failures.length === 0) {
          reportedFailure.current = false;
        }
      } catch (error) {
        if (generation.current !== requestId) return;
        setState((previous) => ({
          ...previous,
          isLoading: false,
          errorMessage: "配信モニターを読み込めませんでした。",
        }));
        if (background && !reportedFailure.current) {
          reportedFailure.current = true;
          reportNotificationBackgroundError(reportFeedback, {
            title: "配信モニターを更新できませんでした",
            message: "前回の表示を保持しています。再読み込みしてください。",
            action: "notification.monitor.refresh",
            endpoint: "/api/v1/admin/notifications/schedules",
            error,
          });
        }
      } finally {
        if (generation.current === requestId) loading.current = false;
      }
    },
    [api, now, reportFeedback]
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void load();
    });
    const refresh = () => {
      if (!document.hidden) void load(true);
    };
    const timer =
      refreshIntervalMs > 0
        ? window.setInterval(refresh, refreshIntervalMs)
        : undefined;
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      generation.current += 1;
      loading.current = false;
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load, refreshIntervalMs]);

  const reload = useCallback(() => load(true), [load]);
  const selectedSchedule =
    state.items.find(
      (item) => item.summary.notificationScheduleId === selectedScheduleId
    ) ?? null;
  return { ...state, reload, selectedSchedule, selectSchedule };
}
