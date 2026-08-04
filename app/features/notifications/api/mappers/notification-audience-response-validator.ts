import type {
  ClassRoomAudienceApiDto,
  ClassRoomAudiencePageApiDto,
  EventAudienceApiDto,
  EventAudiencePageApiDto,
  GatheringAudienceApiDto,
} from "~/features/notifications/api/dto/notification-audience-api-dto";

export function isClassRoomAudiencePageResponse(
  value: unknown
): value is ClassRoomAudiencePageApiDto {
  return (
    isRecord(value) &&
    Array.isArray(value.classrooms) &&
    isNonNegativeInteger(value.total) &&
    isPositiveInteger(value.limit) &&
    isNonNegativeInteger(value.offset)
  );
}

export function isEventAudiencePageResponse(
  value: unknown
): value is EventAudiencePageApiDto {
  return (
    isRecord(value) &&
    Array.isArray(value.events) &&
    isNonNegativeInteger(value.total) &&
    isPositiveInteger(value.limit) &&
    isNonNegativeInteger(value.offset)
  );
}

export function isGatheringAudienceResponse(
  value: unknown
): value is GatheringAudienceApiDto[] {
  return Array.isArray(value);
}

export function isClassRoomAudienceResponse(
  value: unknown
): value is ClassRoomAudienceApiDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.class_room_id) &&
    isNonEmptyString(value.class_code) &&
    isNonEmptyString(value.class_name)
  );
}

export function isEventAudienceResponse(
  value: unknown
): value is EventAudienceApiDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.event_id) &&
    isNonEmptyString(value.event_name)
  );
}

export function isGatheringAudienceItemResponse(
  value: unknown
): value is GatheringAudienceApiDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_id) &&
    isNonEmptyString(value.event_name) &&
    isNonEmptyString(value.gathering_spot_name) &&
    isNonEmptyString(value.gathering_time)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
