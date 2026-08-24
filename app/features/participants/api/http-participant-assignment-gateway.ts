import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

import type { ParticipantAssignment } from "../model/participant-assignment";
import {
  toParticipantAssignments,
  type ParticipantAssignmentSource,
} from "./participant-assignment-mapper";

type ParticipantApiClient = {
  delete(path: string): Promise<void>;
  get(path: string): Promise<unknown>;
};

export type ParticipantAssignmentGateway = {
  delete(gatheringId: number): Promise<void>;
  load(): Promise<ParticipantAssignment[]>;
};

const INVALID_RESPONSE_MESSAGE = "出場メンバーのデータ形式が不正です。";

export function createHttpParticipantAssignmentGateway(
  client: ParticipantApiClient = apiClient
): ParticipantAssignmentGateway {
  return {
    delete(gatheringId) {
      return client.delete(`/api/v1/gatherings/${gatheringId}`);
    },
    async load() {
      const [
        classrooms,
        students,
        events,
        gatheringSpotsResponse,
        gatheringsResponse,
      ] = await Promise.all([
        loadAllPageItems(
          client,
          "/api/v1/classrooms",
          "classrooms",
          isClassroom
        ),
        loadAllPageItems(client, "/api/v1/students", "students", isStudent),
        loadAllPageItems(client, "/api/v1/events", "events", isEvent),
        client.get("/api/v1/gathering-spots"),
        client.get("/api/v1/gatherings"),
      ]);

      const source = parseBaseResponses(
        classrooms,
        students,
        events,
        gatheringSpotsResponse,
        gatheringsResponse
      );
      const memberEntries = await Promise.all(
        source.gatherings.map(
          async (gathering) =>
            [
              gathering.gathering_id,
              parseMembers(
                await client.get(
                  `/api/v1/gatherings/${gathering.gathering_id}/members`
                )
              ),
            ] as const
        )
      );

      return toParticipantAssignments({
        ...source,
        membersByGatheringId: new Map(memberEntries),
      });
    },
  };
}

export const httpParticipantAssignmentGateway =
  createHttpParticipantAssignmentGateway();

function parseBaseResponses(
  classrooms: ParticipantAssignmentSource["classrooms"],
  students: ParticipantAssignmentSource["students"],
  events: ParticipantAssignmentSource["events"],
  gatheringSpotsResponse: unknown,
  gatheringsResponse: unknown
): Omit<ParticipantAssignmentSource, "membersByGatheringId"> {
  if (
    !Array.isArray(gatheringSpotsResponse) ||
    !Array.isArray(gatheringsResponse)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const gatheringSpots = gatheringSpotsResponse.filter(isGatheringSpot);
  const gatherings = gatheringsResponse.filter(isGathering);

  if (
    gatheringSpots.length !== gatheringSpotsResponse.length ||
    gatherings.length !== gatheringsResponse.length
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return { classrooms, students, events, gatheringSpots, gatherings };
}

function loadAllPageItems<T>(
  client: ParticipantApiClient,
  path: string,
  key: string,
  guard: (value: unknown) => value is T
): Promise<T[]> {
  return loadAllPages(async (offset, limit) => {
    const value = await client.get(`${path}?limit=${limit}&offset=${offset}`);
    if (
      !isRecord(value) ||
      !Array.isArray(value[key]) ||
      !isNonNegativeInteger(value.total) ||
      !value[key].every(guard)
    ) {
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }
    return { items: value[key], total: value.total };
  });
}

function parseMembers(value: unknown) {
  if (!Array.isArray(value) || !value.every(isMember)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  return value;
}

function isClassroom(
  value: unknown
): value is ParticipantAssignmentSource["classrooms"][number] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.class_room_id) &&
    typeof value.class_name === "string"
  );
}

function isStudent(
  value: unknown
): value is ParticipantAssignmentSource["students"][number] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.user_id) &&
    typeof value.display_name === "string" &&
    isPositiveInteger(value.class_room_id)
  );
}

function isEvent(
  value: unknown
): value is ParticipantAssignmentSource["events"][number] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.event_id) &&
    typeof value.event_name === "string" &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

function isGathering(
  value: unknown
): value is ParticipantAssignmentSource["gatherings"][number] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_id) &&
    isPositiveInteger(value.event_id) &&
    isPositiveInteger(value.gathering_spot_id) &&
    typeof value.gathering_time === "string"
  );
}

function isGatheringSpot(
  value: unknown
): value is ParticipantAssignmentSource["gatheringSpots"][number] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_spot_id) &&
    typeof value.gathering_spot_name === "string"
  );
}

function isMember(value: unknown): value is { user_id: number } {
  return isRecord(value) && isPositiveInteger(value.user_id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
