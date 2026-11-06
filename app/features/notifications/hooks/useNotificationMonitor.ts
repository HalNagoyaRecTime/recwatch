import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  NotificationScheduleDetail,
  NotificationScheduleQueryApi,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  reportNotificationBackgroundError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import {
  getMonitorWindow,
  hasMonitorProgress,
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
  const inFlight = useRef<Promise<void> | null>(null);
  const reportedFailure = useRef(false);
  const [selectedScheduleId, selectSchedule] = useState<number | null>(null);
  const [details, setDetails] = useState<
    Record<number, NotificationScheduleDetail>
  >({});
  const detailsInFlight = useRef(new Set<number>());
  const failedDetailIds = useRef(new Set<number>());
  const reportedDetailFailure = useRef(false);

  const load = useCallback(
    async (background = false, force = false) => {
      if (loading.current && !force) return;
      loading.current = true;
      let finish!: () => void;
      const settled = new Promise<void>((resolve) => {
        finish = resolve;
      });
      inFlight.current = settled;
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
        failedDetailIds.current.clear();
        setState({
          items: response.items.filter((item) =>
            isMonitorScheduleVisible(item, at)
          ),
          isLoading: false,
          hasLoaded: true,
          errorMessage: null,
          updatedAt: at,
        });
        reportedFailure.current = false;
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
        finish();
        if (inFlight.current === settled) inFlight.current = null;
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
  const reloadAfterMutation = useCallback(async () => {
    // apiClientが進行中のGETを共有するため、完了後に新しいGETを開始します。
    generation.current += 1;
    await inFlight.current;
    await load(true, true);
  }, [load]);
  // 一覧はcompleted・failedの進み具合をnullで返すため、表示するものだけ詳細を取ります。
  // この2つは以後進み具合が変わらないため、取った詳細は取り直しません。
  const loadDetails = useCallback(
    async (ids: readonly number[]) => {
      const targets = state.items
        .filter((item) => !hasMonitorProgress(item))
        .map((item) => item.notificationScheduleId)
        .filter(
          (id) =>
            ids.includes(id) &&
            !(id in details) &&
            !detailsInFlight.current.has(id) &&
            !failedDetailIds.current.has(id)
        );
      for (const id of targets) detailsInFlight.current.add(id);
      let next = 0;
      const failures: unknown[] = [];
      const worker = async () => {
        while (next < targets.length) {
          const id = targets[next++];
          try {
            const detail = await api.getDetail(id);
            setDetails((previous) => ({ ...previous, [id]: detail }));
          } catch (error) {
            failedDetailIds.current.add(id);
            failures.push(error);
          } finally {
            detailsInFlight.current.delete(id);
          }
        }
      };
      // 状態別一覧を開いた直後は送り終えた配信が多いので、同時実行数を制限します。
      await Promise.all(
        Array.from({ length: Math.min(4, targets.length) }, worker)
      );
      if (failures.length === 0) {
        if (targets.length > 0) reportedDetailFailure.current = false;
        return;
      }
      if (reportedDetailFailure.current) return;
      reportedDetailFailure.current = true;
      reportNotificationBackgroundError(reportFeedback, {
        title: "配信集計を読み込めませんでした",
        message: "次の更新で読み込み直します。",
        action: "notification.monitor.detail",
        endpoint: "/api/v1/admin/notifications/schedules/{id}",
        error: failures[0],
      });
    },
    [api, details, reportFeedback, state.items]
  );
  const items = useMemo(
    () =>
      state.items.map((item) => {
        const detail = details[item.notificationScheduleId];
        return hasMonitorProgress(item) || !detail
          ? item
          : {
              ...item,
              audienceProgress: detail.audienceProgress,
              recipientProgress: detail.recipientProgress,
              deliveryProgress: detail.deliveryProgress,
            };
      }),
    [state.items, details]
  );
  const selectedSchedule =
    items.find((item) => item.notificationScheduleId === selectedScheduleId) ??
    null;
  return {
    ...state,
    items,
    loadDetails,
    reload,
    reloadAfterMutation,
    selectedSchedule,
    selectSchedule,
  };
}
