import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AdminNotificationDetail,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import type {
  NotificationPushDeliveryApi,
  NotificationPushDeliveryDetail,
} from "~/features/notifications/api/contracts/notification-push-delivery-api";
import type {
  NotificationScheduleDetail,
  NotificationScheduleQueryApi,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import { readApiErrorStatus } from "~/features/notifications/api/mappers/notification-api-error-mapper";

type AsyncSection<T> = {
  data: T | null;
  errorMessage: string | null;
  isLoading: boolean;
};

const emptySection = <T>(): AsyncSection<T> => ({
  data: null,
  errorMessage: null,
  isLoading: false,
});

type UseNotificationDetailOptions = {
  notificationId: number;
  pushDeliveryApi: NotificationPushDeliveryApi;
  queryApi: AdminNotificationQueryApi;
  scheduleQueryApi: NotificationScheduleQueryApi;
};

export function useNotificationDetail({
  notificationId,
  pushDeliveryApi,
  queryApi,
  scheduleQueryApi,
}: UseNotificationDetailOptions) {
  const [notification, setNotification] =
    useState<AsyncSection<AdminNotificationDetail>>(emptySection);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [schedule, setSchedule] =
    useState<AsyncSection<NotificationScheduleDetail>>(emptySection);
  const [results, setResults] =
    useState<AsyncSection<NotificationScheduleResults>>(emptySection);
  const [delivery, setDelivery] =
    useState<AsyncSection<NotificationPushDeliveryDetail>>(emptySection);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null
  );
  const notificationRequestId = useRef(0);
  const scheduleRequestId = useRef(0);
  const resultsRequestId = useRef(0);
  const deliveryRequestId = useRef(0);

  const selectSchedule = useCallback((scheduleId: number | null) => {
    scheduleRequestId.current += 1;
    resultsRequestId.current += 1;
    deliveryRequestId.current += 1;
    setSelectedScheduleId(scheduleId);
    setSchedule(emptySection());
    setResults(emptySection());
    setSelectedDeliveryId(null);
    setDelivery(emptySection());
  }, []);

  const loadNotification = useCallback(async () => {
    if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
      setNotification({
        data: null,
        errorMessage: "通知が見つかりません。",
        isLoading: false,
      });
      return;
    }
    const requestId = ++notificationRequestId.current;
    setNotification((current) => ({
      ...current,
      errorMessage: null,
      isLoading: true,
    }));
    try {
      const data = await queryApi.getDetail(notificationId);
      if (requestId !== notificationRequestId.current) return;
      setNotification({ data, errorMessage: null, isLoading: false });
      selectSchedule(data.schedules[0]?.notificationScheduleId ?? null);
    } catch (error) {
      if (requestId !== notificationRequestId.current) return;
      setNotification({
        data: null,
        errorMessage:
          readApiErrorStatus(error) === 404
            ? "通知が見つかりません。"
            : "通知詳細を読み込めませんでした。",
        isLoading: false,
      });
    }
  }, [notificationId, queryApi, selectSchedule]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadNotification();
    });
    return () => {
      active = false;
      notificationRequestId.current += 1;
    };
  }, [loadNotification, notificationId]);

  const loadSchedule = useCallback(async () => {
    if (selectedScheduleId === null) return;
    const requestId = ++scheduleRequestId.current;
    setSchedule({ data: null, errorMessage: null, isLoading: true });
    try {
      const data = await scheduleQueryApi.getDetail(selectedScheduleId);
      if (requestId === scheduleRequestId.current) {
        setSchedule({ data, errorMessage: null, isLoading: false });
      }
    } catch (error) {
      if (requestId !== scheduleRequestId.current) return;
      setSchedule({
        data: null,
        errorMessage:
          readApiErrorStatus(error) === 404
            ? "Scheduleが見つかりません。"
            : "Scheduleの詳細を読み込めませんでした。",
        isLoading: false,
      });
    }
  }, [scheduleQueryApi, selectedScheduleId]);

  useEffect(() => {
    if (selectedScheduleId === null) return;

    let active = true;
    queueMicrotask(() => {
      if (active) void loadSchedule();
    });

    return () => {
      active = false;
      scheduleRequestId.current += 1;
    };
  }, [loadSchedule, selectedScheduleId]);

  const loadResults = useCallback(
    async (page = 1) => {
      if (selectedScheduleId === null) return;
      const requestId = ++resultsRequestId.current;
      setResults((current) => ({
        ...current,
        errorMessage: null,
        isLoading: true,
      }));
      try {
        const data = await scheduleQueryApi.getResults(selectedScheduleId, {
          page,
          limit: 50,
        });
        if (requestId === resultsRequestId.current) {
          setResults({ data, errorMessage: null, isLoading: false });
        }
      } catch {
        if (requestId === resultsRequestId.current) {
          setResults((current) => ({
            ...current,
            errorMessage: "配信結果を読み込めませんでした。",
            isLoading: false,
          }));
        }
      }
    },
    [scheduleQueryApi, selectedScheduleId]
  );

  const openDelivery = useCallback(
    async (notificationPushDeliveryId: number) => {
      const requestId = ++deliveryRequestId.current;
      setSelectedDeliveryId(notificationPushDeliveryId);
      setDelivery({ data: null, errorMessage: null, isLoading: true });
      try {
        const data = await pushDeliveryApi.getDetail(
          notificationPushDeliveryId
        );
        if (requestId === deliveryRequestId.current) {
          setDelivery({ data, errorMessage: null, isLoading: false });
        }
      } catch (error) {
        if (requestId !== deliveryRequestId.current) return;
        setDelivery({
          data: null,
          errorMessage:
            readApiErrorStatus(error) === 404
              ? "Push配送が見つかりません。"
              : "Push配送詳細を読み込めませんでした。",
          isLoading: false,
        });
      }
    },
    [pushDeliveryApi]
  );

  const closeDelivery = useCallback(() => {
    deliveryRequestId.current += 1;
    setSelectedDeliveryId(null);
    setDelivery(emptySection());
  }, []);

  return {
    closeDelivery,
    delivery,
    loadNotification,
    loadResults,
    loadSchedule,
    notification,
    openDelivery,
    results,
    schedule,
    selectedDeliveryId,
    selectedScheduleId,
    selectSchedule,
  };
}
