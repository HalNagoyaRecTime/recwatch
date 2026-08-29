import { NotificationAudienceLoadingError } from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import type {
  ClassRoomAudienceApiDto,
  ClassRoomAudiencePageApiDto,
  EventAudienceApiDto,
  EventAudiencePageApiDto,
  GatheringAudienceApiDto,
} from "~/features/notifications/api/dto/notification-audience-api-dto";
import {
  isClassRoomAudiencePageResponse,
  isClassRoomAudienceResponse,
  isEventAudiencePageResponse,
  isEventAudienceResponse,
  isGatheringAudienceItemResponse,
  isGatheringAudienceResponse,
} from "~/features/notifications/api/mappers/notification-audience-response-validator";

export function toClassRoomAudiencePage(
  response: unknown
): ClassRoomAudiencePageApiDto {
  if (!isClassRoomAudiencePageResponse(response)) {
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
  if (!isEventAudiencePageResponse(response)) {
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
  if (!isGatheringAudienceResponse(response)) {
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
  if (!isClassRoomAudienceResponse(value)) {
    throw unexpectedResponse();
  }

  return {
    class_room_id: value.class_room_id,
    class_code: value.class_code,
    class_name: value.class_name,
  };
}

function toEventDto(value: unknown): EventAudienceApiDto {
  if (!isEventAudienceResponse(value)) {
    throw unexpectedResponse();
  }

  return {
    event_id: value.event_id,
    event_name: value.event_name,
  };
}

function toGatheringDto(value: unknown): GatheringAudienceApiDto {
  if (!isGatheringAudienceItemResponse(value)) {
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
