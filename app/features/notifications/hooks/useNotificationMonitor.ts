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
  getMonitorProgress,
  getMonitorWindow,
  hasMonitorProgress,
  isMonitorScheduleVisible,
  type MonitorProgress,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";

const currentTime = () => Date.now();

function isSettledSchedule(schedule: NotificationScheduleDetail) {
  return schedule.status === "completed" || schedule.status === "failed";
}

type CachedProgress = MonitorProgress & {
  isSettled: boolean;
  generation: number;
};

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
  const [progress, setProgress] = useState<Record<number, CachedProgress>>({});
  const detailsInFlight = useRef(new Set<number>());
  const failedDetailIds = useRef(new Set<number>());
  const detailsGeneration = useRef(0);
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
        const items = response.items.filter((item) =>
          isMonitorScheduleVisible(item, at)
        );
        failedDetailIds.current.clear();
        detailsInFlight.current.clear();
        const detailsRequestId = ++detailsGeneration.current;
        setProgress((previous) => {
          const next: Record<number, CachedProgress> = {};
          for (const item of items) {
            const id = item.notificationScheduleId;
            // 完了して一覧の進み具合がnullになったとき、詳細が届くまで出す値として残します。
            if (hasMonitorProgress(item)) {
              next[id] = {
                ...getMonitorProgress(item),
                isSettled: false,
                generation: detailsRequestId,
              };
            } else if (previous[id]) {
              next[id] = previous[id];
            }
          }
          return next;
        });
        setState({
          items,
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
  // 進み具合を返す前のAPIでは進行中の配信もnullになるので、それは一覧の更新ごとに取り直し、
  // 届くまでは前回の進み具合を出したままにします。
  const loadDetails = useCallback(
    async (ids: readonly number[]) => {
      const requestGeneration = detailsGeneration.current;
      const targets = state.items
        .filter((item) => !hasMonitorProgress(item))
        .map((item) => item.notificationScheduleId)
        .filter((id) => {
          const cached = progress[id];
          return (
            ids.includes(id) &&
            !(
              cached &&
              (cached.isSettled || cached.generation === requestGeneration)
            ) &&
            !detailsInFlight.current.has(id) &&
            !failedDetailIds.current.has(id)
          );
        });
      for (const id of targets) detailsInFlight.current.add(id);
      let next = 0;
      const failures: unknown[] = [];
      const worker = async () => {
        while (
          next < targets.length &&
          detailsGeneration.current === requestGeneration
        ) {
          const id = targets[next++];
          try {
            const detail = await api.getDetail(id);
            if (detailsGeneration.current !== requestGeneration) continue;
            setProgress((previous) => ({
              ...previous,
              [id]: {
                ...getMonitorProgress(detail),
                isSettled: isSettledSchedule(detail),
                generation: requestGeneration,
              },
            }));
          } catch (error) {
            if (detailsGeneration.current !== requestGeneration) continue;
            failedDetailIds.current.add(id);
            failures.push(error);
          } finally {
            if (detailsGeneration.current === requestGeneration)
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
    [api, progress, reportFeedback, state.items]
  );
  const items = useMemo(
    () =>
      state.items.map((item) => {
        const cached = progress[item.notificationScheduleId];
        return hasMonitorProgress(item) || !cached
          ? item
          : { ...item, ...getMonitorProgress(cached) };
      }),
    [state.items, progress]
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
