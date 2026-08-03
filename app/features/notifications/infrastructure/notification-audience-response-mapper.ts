import { NotificationAudienceLoadingError } from "~/features/notifications/application/notification-audience-loading-error";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience-option";
import type {
  ClassRoomAudienceApiDto,
  ClassRoomAudiencePageApiDto,
  EventAudienceApiDto,
  EventAudiencePageApiDto,
  GatheringAudienceApiDto,
} from "~/features/notifications/infrastructure/notification-audience-api-dto";

export function toClassRoomAudiencePage(
  response: unknown
): ClassRoomAudiencePageApiDto {
  if (
    !isRecord(response) ||
    !Array.isArray(response.classrooms) ||
    !isNonNegativeInteger(response.total) ||
    !isPositiveInteger(response.limit) ||
    !isNonNegativeInteger(response.offset)
  ) {
    throw unexpectedResponse();
  }

  return {
    classrooms: response.classrooms.map(toClassRoomDto),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

export function toEventAudiencePage(
  response: unknown
): EventAudiencePageApiDto {
  if (
    !isRecord(response) ||
    !Array.isArray(response.events) ||
    !isNonNegativeInteger(response.total) ||
    !isPositiveInteger(response.limit) ||
    !isNonNegativeInteger(response.offset)
  ) {
    throw unexpectedResponse();
  }

  return {
    events: response.events.map(toEventDto),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

export function toGatheringAudienceDtos(
  response: unknown
): GatheringAudienceApiDto[] {
  if (!Array.isArray(response)) {
    throw unexpectedResponse();
  }

  return response.map(toGatheringDto);
}

export function toNotificationAudienceOptions(input: {
  classrooms: ClassRoomAudienceApiDto[];
  gatherings: GatheringAudienceApiDto[];
  events: EventAudienceApiDto[];
}): NotificationAudienceOption[] {
  return [
    ...input.classrooms.map((classroom) => ({
      id: String(classroom.class_room_id),
      name: `${classroom.class_code} ${classroom.class_name}`.trim(),
      type: "class_room" as const,
    })),
    ...input.gatherings.map((gathering) => ({
      id: String(gathering.gathering_id),
      name: formatGatheringName(gathering),
      type: "gathering" as const,
    })),
    ...input.events.map((event) => ({
      id: String(event.event_id),
      name: event.event_name,
      type: "event_participants" as const,
    })),
  ];
}

function toClassRoomDto(value: unknown): ClassRoomAudienceApiDto {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.class_room_id) ||
    !isNonEmptyString(value.class_code) ||
    !isNonEmptyString(value.class_name)
  ) {
    throw unexpectedResponse();
  }

  return {
    class_room_id: value.class_room_id,
    class_code: value.class_code,
    class_name: value.class_name,
  };
}

function toEventDto(value: unknown): EventAudienceApiDto {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.event_id) ||
    !isNonEmptyString(value.event_name)
  ) {
    throw unexpectedResponse();
  }

  return {
    event_id: value.event_id,
    event_name: value.event_name,
  };
}

function toGatheringDto(value: unknown): GatheringAudienceApiDto {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.gathering_id) ||
    !isNonEmptyString(value.event_name) ||
    !isNonEmptyString(value.gathering_spot_name) ||
    !isNonEmptyString(value.gathering_time)
  ) {
    throw unexpectedResponse();
  }

  return {
    gathering_id: value.gathering_id,
    event_name: value.event_name,
    gathering_spot_name: value.gathering_spot_name,
    gathering_time: value.gathering_time,
  };
}

function formatGatheringName(gathering: GatheringAudienceApiDto) {
  const time = /^\d{4}$/.test(gathering.gathering_time)
    ? `${gathering.gathering_time.slice(0, 2)}:${gathering.gathering_time.slice(2)}`
    : gathering.gathering_time;

  return `${gathering.event_name} / ${gathering.gathering_spot_name} (${time})`;
}

function unexpectedResponse() {
  return new NotificationAudienceLoadingError("unexpected");
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
