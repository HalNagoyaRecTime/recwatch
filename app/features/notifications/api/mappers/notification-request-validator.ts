import type {
  NotificationCreateRequestDto,
  NotificationPatchRequestDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import type {
  NotificationAudienceInputDto,
  NotificationDeliveryInputDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationResendRequestDto } from "~/features/notifications/api/dto/notification-schedule-dto";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function validateNotificationCreateRequest(
  request: NotificationCreateRequestDto
) {
  requireText(request.content.push.title);
  requireText(request.content.push.body);
  requireText(request.content.detail.title);
  requireText(request.content.detail.body);
  validateNotificationAudienceInput(request.audience);
  validateNotificationDeliveryInput(request.delivery);
  return request;
}

export function validateNotificationPatchRequest(
  request: NotificationPatchRequestDto
) {
  if (
    request.content === undefined &&
    request.importance === undefined &&
    request.schedule === undefined
  ) {
    throw invalidRequest();
  }

  const push = request.content?.push;
  const detail = request.content?.detail;
  if (push && push.title === undefined && push.body === undefined) {
    throw invalidRequest();
  }
  if (detail && detail.title === undefined && detail.body === undefined) {
    throw invalidRequest();
  }
  if (push?.title !== undefined) requireText(push.title);
  if (push?.body !== undefined) requireText(push.body);
  if (detail?.title !== undefined) requireText(detail.title);
  if (detail?.body !== undefined) requireText(detail.body);

  if (request.schedule) {
    if (
      !Number.isSafeInteger(request.schedule.notificationScheduleId) ||
      request.schedule.notificationScheduleId <= 0 ||
      (request.schedule.audience === undefined &&
        request.schedule.delivery === undefined)
    ) {
      throw invalidRequest();
    }
    if (request.schedule.audience) {
      validateNotificationAudienceInput(request.schedule.audience);
    }
    if (request.schedule.delivery) {
      validateNotificationDeliveryInput(request.schedule.delivery);
    }
  }

  return request;
}

export function validateNotificationAudienceInput(
  audience: NotificationAudienceInputDto
) {
  if (audience.items.length === 0) throw invalidRequest();

  for (const item of audience.items) {
    if (
      item.type !== "all" &&
      (!Number.isSafeInteger(item.targetId) || item.targetId <= 0)
    ) {
      throw invalidRequest();
    }
  }
  return audience;
}

export function validateNotificationResendRequest(
  request: NotificationResendRequestDto
) {
  validateNotificationDeliveryInput(request.delivery);
  return request;
}

function validateNotificationDeliveryInput(
  delivery: NotificationDeliveryInputDto
) {
  if (delivery.type === "immediate") {
    if (delivery.sendAt !== null) throw invalidRequest();
    return;
  }

  if (
    !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(delivery.sendAt) ||
    !Number.isFinite(Date.parse(delivery.sendAt))
  ) {
    throw invalidRequest();
  }
}

function requireText(value: string) {
  if (!value.trim()) throw invalidRequest();
}

function invalidRequest() {
  return new ClientError(ClientErrors.INVALID_REQUEST);
}
