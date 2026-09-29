import type {
  ClassRoomAudienceApiDto,
  EventAudienceApiDto,
  EventAudienceDetailApiDto,
  EventAudienceGatheringApiDto,
  EventAudiencePageApiDto,
  EventAudienceRoundApiDto,
  GatheringAudienceApiDto,
} from "~/features/notifications/api/dto/notification-audience-api-dto";

type ClassRoomAudiencePageResponse = {
  items: unknown[];
  total: number;
  limit: number;
  offset: number;
};

export function isClassRoomAudiencePageResponse(
  value: unknown
): value is ClassRoomAudiencePageResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
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

export function isEventAudienceDetailResponse(
  value: unknown
): value is EventAudienceDetailApiDto {
  return (
    isRecord(value) &&
    Array.isArray(value.rounds) &&
    value.rounds.every(isEventAudienceRoundResponse)
  );
}

function isEventAudienceRoundResponse(
  value: unknown
): value is EventAudienceRoundApiDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.round) &&
    Array.isArray(value.gatherings) &&
    value.gatherings.every(isEventAudienceGatheringResponse)
  );
}

function isEventAudienceGatheringResponse(
  value: unknown
): value is EventAudienceGatheringApiDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_id) &&
    isNonEmptyString(value.gathering_time) &&
    isRecord(value.gathering_spot) &&
    isPositiveInteger(value.gathering_spot.gathering_spot_id) &&
    isNonEmptyString(value.gathering_spot.gathering_spot_name) &&
    isNonNegativeInteger(value.member_count)
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
