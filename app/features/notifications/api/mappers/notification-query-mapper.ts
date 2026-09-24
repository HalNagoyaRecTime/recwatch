import type { NotificationDateRangeQueryDto } from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationScheduleResultsQueryDto } from "~/features/notifications/api/dto/notification-schedule-dto";
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

  const from = Date.parse(query.from);
  const to = Date.parse(query.to);
  if (
    !isOffsetDateTime(query.from) ||
    !isOffsetDateTime(query.to) ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from > to
  ) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }

  const search = new URLSearchParams({ from: query.from, to: query.to });
  return `${basePath}?${search.toString()}`;
}

function isOffsetDateTime(value: string) {
  return /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value);
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
