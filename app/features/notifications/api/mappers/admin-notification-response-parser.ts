import type {
  AdminNotificationDetailDto,
  AdminNotificationListResponseDto,
  NotificationAudienceCountDto,
  NotificationConfigDto,
  NotificationCreateResponseDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import {
  isAdminNotificationDetail,
  isAdminNotificationListResponse,
  isNotificationAudienceCount,
  isNotificationConfig,
  isNotificationCreateResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-validator";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function parseAdminNotificationListResponse(
  value: unknown
): AdminNotificationListResponseDto {
  if (!isAdminNotificationListResponse(value)) throw unexpectedResponse();
  return value;
}

export function parseAdminNotificationDetail(
  value: unknown
): AdminNotificationDetailDto {
  if (!isAdminNotificationDetail(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationCreateResponse(
  value: unknown
): NotificationCreateResponseDto {
  if (!isNotificationCreateResponse(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationConfig(value: unknown): NotificationConfigDto {
  if (!isNotificationConfig(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationAudienceCount(
  value: unknown
): NotificationAudienceCountDto {
  if (!isNotificationAudienceCount(value)) throw unexpectedResponse();
  return value;
}

function unexpectedResponse() {
  return new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
}
