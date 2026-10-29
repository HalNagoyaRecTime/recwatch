import type { AdminNotificationListQuery } from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationDateRangeQueryDto } from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationScheduleResultsQueryDto } from "~/features/notifications/api/dto/notification-schedule-dto";
import { isOffsetDateTimeString } from "~/features/notifications/api/mappers/notification-dto-validator";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function toNotificationDateRangePath(
  basePath: string,
  query: NotificationDateRangeQueryDto = {}
) {
  if (query.from === undefined && query.to === undefined) {
    return basePath;
  }

  if (query.from === undefined || query.to === undefined) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }

  if (
    !isOffsetDateTimeString(query.from) ||
    !isOffsetDateTimeString(query.to) ||
    Date.parse(query.from) > Date.parse(query.to)
  ) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }

  const search = new URLSearchParams({ from: query.from, to: query.to });
  return `${basePath}?${search.toString()}`;
}

export function toAdminNotificationListPath(
  basePath: string,
  query: AdminNotificationListQuery = {}
) {
  const params: Record<string, string> = {};

  if (
    query.page !== undefined &&
    Number.isSafeInteger(query.page) &&
    query.page > 0
  ) {
    params.page = String(query.page);
  }
  if (
    query.limit !== undefined &&
    Number.isSafeInteger(query.limit) &&
    query.limit > 0
  ) {
    params.limit = String(query.limit);
  }
  if (query.search !== undefined && query.search.trim() !== "") {
    params.search = query.search.trim();
  }
  if (query.status !== undefined) {
    params.status = query.status;
  }
  if (query.dateMode !== undefined) {
    params.dateMode = query.dateMode;
    if (query.dateMode === "date" && query.dateValue) {
      params.dateValue = query.dateValue;
    } else if (query.dateMode === "range") {
      if (query.dateFrom) params.dateFrom = query.dateFrom;
      if (query.dateTo) params.dateTo = query.dateTo;
    }
  }
  if (query.creationMethod !== undefined) {
    params.creationMethod = query.creationMethod;
  }
  if (query.sort !== undefined) {
    params.sort = `${query.sort.columnId}:${query.sort.direction}`;
  }

  const search = new URLSearchParams(params);
  return `${basePath}?${search.toString()}`;
}

export function toNotificationScheduleResultsPath(
  notificationScheduleId: number,
  query: NotificationScheduleResultsQueryDto
) {
  requirePositiveId(notificationScheduleId);
  if (
    !Number.isSafeInteger(query.page) ||
    query.page < 1 ||
    !Number.isSafeInteger(query.limit) ||
    query.limit < 1 ||
    query.limit > 100
  ) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }

  const search = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  return `/api/v1/admin/notifications/schedules/${notificationScheduleId}/results?${search.toString()}`;
}

export function requirePositiveId(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }
}
