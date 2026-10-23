import type {
  NotificationCreateRequestDto,
  NotificationContentPatchDto,
  NotificationPatchRequestDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import type {
  NotificationAudienceInputDto,
  NotificationDeliveryInputDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import {
  NOTIFICATION_AUDIENCE_TYPES,
  NOTIFICATION_DELIVERY_TYPES,
  NOTIFICATION_TARGET_AUDIENCE_TYPES,
} from "~/features/notifications/api/dto/notification-common-dto";
import {
  hasExactKeys,
  hasOnlyKeys,
  isNotificationImportance,
  isOffsetDateTimeString,
  isOneOf,
  isRecord,
} from "~/features/notifications/api/mappers/notification-dto-validator";
import type { NotificationResendRequestDto } from "~/features/notifications/api/dto/notification-schedule-dto";
import { ClientError, ClientErrors } from "~/lib/client-error";

type ContentPatchBlock = NonNullable<NotificationContentPatchDto["push"]>;
type SchedulePatch = NonNullable<NotificationPatchRequestDto["schedule"]>;

export function validateNotificationCreateRequest(
  request: NotificationCreateRequestDto
) {
  if (
    !isRecord(request) ||
    !hasExactKeys(request, ["content", "audience", "delivery", "importance"])
  ) {
    throw invalidRequest();
  }

  validateNotificationContent(request.content);
  validateNotificationAudienceInput(request.audience);
  validateNotificationDeliveryInput(request.delivery);
  if (!isNotificationImportance(request.importance)) throw invalidRequest();
  return request;
}

export function validateNotificationPatchRequest(
  request: NotificationPatchRequestDto
) {
  if (
    !isRecord(request) ||
    !hasOnlyKeys(request, ["content", "importance", "schedule"]) ||
    (request.content === undefined &&
      request.importance === undefined &&
      request.schedule === undefined)
  ) {
    throw invalidRequest();
  }

  if (request.content !== undefined) {
    validateNotificationContentPatch(request.content);
  }
  if (
    request.importance !== undefined &&
    !isNotificationImportance(request.importance)
  ) {
    throw invalidRequest();
  }
  if (request.schedule !== undefined) {
    validateNotificationSchedulePatch(request.schedule);
  }

  return request;
}

export function validateNotificationAudienceInput(
  audience: NotificationAudienceInputDto
) {
  if (!isRecord(audience) || !hasExactKeys(audience, ["items"])) {
    throw invalidRequest();
  }
  if (!Array.isArray(audience.items) || audience.items.length === 0) {
    throw invalidRequest();
  }

  const includesAll = audience.items.some((item) => item.type === "all");
  if (includesAll && audience.items.length > 1) throw invalidRequest();

  const audienceKeys = new Set<string>();

  for (const item of audience.items) {
    if (!isRecord(item) || !isOneOf(item.type, NOTIFICATION_AUDIENCE_TYPES)) {
      throw invalidRequest();
    }
    if (item.type === "all") {
      if (!hasExactKeys(item, ["type"])) throw invalidRequest();
    } else {
      if (
        !isOneOf(item.type, NOTIFICATION_TARGET_AUDIENCE_TYPES) ||
        !hasExactKeys(item, ["type", "targetId"]) ||
        !Number.isSafeInteger(item.targetId) ||
        item.targetId <= 0
      ) {
        throw invalidRequest();
      }
    }

    const key =
      item.type === "all" ? item.type : `${item.type}:${item.targetId}`;
    if (audienceKeys.has(key)) throw invalidRequest();
    audienceKeys.add(key);
  }
  return audience;
}

export function validateNotificationResendRequest(
  request: NotificationResendRequestDto
) {
  if (!isRecord(request) || !hasExactKeys(request, ["delivery"])) {
    throw invalidRequest();
  }
  validateNotificationDeliveryInput(request.delivery);
  return request;
}

function validateNotificationContent(
  content: NotificationCreateRequestDto["content"]
) {
  if (!isRecord(content) || !hasExactKeys(content, ["push", "detail"])) {
    throw invalidRequest();
  }
  validateContentBlock(content.push);
  validateContentBlock(content.detail);
}

function validateContentBlock(block: { title: string; body: string }) {
  if (!isRecord(block) || !hasExactKeys(block, ["title", "body"])) {
    throw invalidRequest();
  }
  requireText(block.title);
  requireText(block.body);
}

function validateNotificationContentPatch(
  content: NotificationContentPatchDto
) {
  if (
    !isRecord(content) ||
    !hasOnlyKeys(content, ["push", "detail"]) ||
    (content.push === undefined && content.detail === undefined)
  ) {
    throw invalidRequest();
  }
  if (content.push !== undefined) validateContentPatchBlock(content.push);
  if (content.detail !== undefined) validateContentPatchBlock(content.detail);
}

function validateContentPatchBlock(block: ContentPatchBlock) {
  if (
    !isRecord(block) ||
    !hasOnlyKeys(block, ["title", "body"]) ||
    (block.title === undefined && block.body === undefined)
  ) {
    throw invalidRequest();
  }
  if (block.title !== undefined) requireText(block.title);
  if (block.body !== undefined) requireText(block.body);
}

function validateNotificationSchedulePatch(schedule: SchedulePatch) {
  if (
    !isRecord(schedule) ||
    !hasOnlyKeys(schedule, [
      "notificationScheduleId",
      "audience",
      "delivery",
    ]) ||
    !Number.isSafeInteger(schedule.notificationScheduleId) ||
    schedule.notificationScheduleId <= 0 ||
    (schedule.audience === undefined && schedule.delivery === undefined)
  ) {
    throw invalidRequest();
  }
  if (schedule.audience !== undefined) {
    validateNotificationAudienceInput(schedule.audience);
  }
  if (schedule.delivery !== undefined) {
    validateNotificationDeliveryInput(schedule.delivery);
  }
}

function validateNotificationDeliveryInput(
  delivery: NotificationDeliveryInputDto
) {
  if (
    !isRecord(delivery) ||
    !hasExactKeys(delivery, ["type", "sendAt"]) ||
    !isOneOf(delivery.type, NOTIFICATION_DELIVERY_TYPES)
  ) {
    throw invalidRequest();
  }

  if (delivery.type === "immediate") {
    if (delivery.sendAt !== null) throw invalidRequest();
    return;
  }

  if (!isOffsetDateTimeString(delivery.sendAt)) throw invalidRequest();
}

function requireText(value: string) {
  if (typeof value !== "string" || !value.trim()) throw invalidRequest();
}

function invalidRequest() {
  return new ClientError(ClientErrors.INVALID_REQUEST);
}
