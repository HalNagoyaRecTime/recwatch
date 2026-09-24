import type {
  NotificationPushDeliveryDetailDto,
  NotificationResendResponseDto,
  NotificationScheduleDetailDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsDto,
  NotificationStopResponseDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";
import { isNotificationCreateResponse } from "~/features/notifications/api/mappers/admin-notification-response-validator";
import {
  isNotificationPushDeliveryDetail,
  isNotificationScheduleDetail,
  isNotificationScheduleListResponse,
  isNotificationScheduleResults,
  isNotificationStopResponse,
} from "~/features/notifications/api/mappers/notification-schedule-response-validator";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function parseNotificationScheduleListResponse(
  value: unknown
): NotificationScheduleListResponseDto {
  if (!isNotificationScheduleListResponse(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationScheduleDetail(
  value: unknown
): NotificationScheduleDetailDto {
  if (!isNotificationScheduleDetail(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationScheduleResults(
  value: unknown
): NotificationScheduleResultsDto {
  if (!isNotificationScheduleResults(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationPushDeliveryDetail(
  value: unknown
): NotificationPushDeliveryDetailDto {
  if (!isNotificationPushDeliveryDetail(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationResendResponse(
  value: unknown
): NotificationResendResponseDto {
  if (!isNotificationCreateResponse(value)) throw unexpectedResponse();
  return value;
}

export function parseNotificationStopResponse(
  value: unknown
): NotificationStopResponseDto {
  if (!isNotificationStopResponse(value)) throw unexpectedResponse();
  return value;
}

function unexpectedResponse() {
  return new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
}
