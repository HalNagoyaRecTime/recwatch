import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

import type { CompetitionAssignmentGateway } from "./competition-assignment-gateway";
import type {
  AssignmentClassroom,
  AssignmentEvent,
  AssignmentGathering,
  AssignmentGatheringSpot,
  AssignmentStudent,
} from "../model/competition-assignment";

type AssignmentApiClient = {
  delete(path: string): Promise<unknown>;
  get(path: string): Promise<unknown>;
  post(path: string, body: unknown): Promise<unknown>;
};

const INVALID_RESPONSE_MESSAGE = "参加者設定のデータ形式が不正です。";

export function createHttpCompetitionAssignmentGateway(
  client: AssignmentApiClient = apiClient
): CompetitionAssignmentGateway {
  async function loadMemberUserIds(gatheringId: number) {
    const members = await client.get(
      `/api/v1/gatherings/${gatheringId}/members`
    );
    return parseArray(members, toMemberUserId);
  }

  return {
    async load() {
      const [classrooms, students, events, spots, gatherings] =
        await Promise.all([
          loadAllPageItems(
            client,
            "/api/v1/classrooms",
            "classrooms",
            toClassroom
          ),
          loadAllPageItems(client, "/api/v1/students", "students", toStudent),
          loadAllPageItems(client, "/api/v1/events", "events", toEvent),
          client.get("/api/v1/gathering-spots"),
          client.get("/api/v1/gatherings"),
        ]);

      return {
        classrooms,
        students,
        events,
        spots: parseArray(spots, toSpot),
        gatherings: parseArray(gatherings, toGathering),
      };
    },

    loadMemberUserIds,

    async save(input) {
      let gatheringId = input.gatheringId;

      if (gatheringId === null) {
        const response = await client.post("/api/v1/gatherings", {
          eventId: input.eventId,
          gatheringSpotId: input.spotId,
          gatheringTime: input.time,
          round: 1,
        });
        gatheringId = parseCreatedGatheringId(response);

        await Promise.all(
          uniqueIds(input.userIds).map((userId) =>
            client.post(`/api/v1/gatherings/${gatheringId}/members`, {
              userId,
            })
          )
        );
      } else {
        const currentUserIds = await loadMemberUserIds(gatheringId);
        const nextUserIds = uniqueIds(input.userIds);
        const toAdd = nextUserIds.filter(
          (userId) => !currentUserIds.includes(userId)
        );
        const toRemove = currentUserIds.filter(
          (userId) => !nextUserIds.includes(userId)
        );

        await Promise.all([
          ...toAdd.map((userId) =>
            client.post(`/api/v1/gatherings/${gatheringId}/members`, {
              userId,
            })
          ),
          ...toRemove.map((userId) =>
            client.delete(`/api/v1/gatherings/${gatheringId}/members/${userId}`)
          ),
        ]);
      }

      return {
        gathering: {
          eventId: input.eventId,
          id: gatheringId,
          spotId: input.spotId,
          time: input.time,
        },
      };
    },
  };
}

export const httpCompetitionAssignmentGateway =
  createHttpCompetitionAssignmentGateway();

function loadAllPageItems<T>(
  client: AssignmentApiClient,
  path: string,
  key: string,
  mapper: (value: unknown) => T | null
): Promise<T[]> {
  return loadAllPages(async (offset, limit) => {
    const value = await client.get(`${path}?limit=${limit}&offset=${offset}`);
    if (
      !isRecord(value) ||
      !Array.isArray(value[key]) ||
      !isNonNegativeInteger(value.total)
    ) {
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }
    return {
      items: parseArray(value[key], mapper),
      total: value.total,
    };
  });
}

function parseArray<T>(
  value: unknown,
  mapper: (value: unknown) => T | null
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  const mapped = value.map(mapper);
  if (mapped.some((item) => item === null)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  return mapped as T[];
}

function toClassroom(value: unknown): AssignmentClassroom | null {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.class_room_id) ||
    typeof value.class_name !== "string"
  ) {
    return null;
  }
  return { id: value.class_room_id, name: value.class_name };
}

function toStudent(value: unknown): AssignmentStudent | null {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.student_id) ||
    !isPositiveInteger(value.user_id) ||
    typeof value.display_name !== "string" ||
    !isPositiveInteger(value.class_room_id) ||
    !isPositiveInteger(value.attendance_number) ||
    typeof value.student_id_number !== "string"
  ) {
    return null;
  }
  return {
    attendanceNumber: value.attendance_number,
    classroomId: value.class_room_id,
    id: value.student_id,
    name: value.display_name,
    studentNumber: value.student_id_number,
    userId: value.user_id,
  };
}

function toEvent(value: unknown): AssignmentEvent | null {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.event_id) ||
    typeof value.event_name !== "string" ||
    typeof value.venue !== "string" ||
    typeof value.start_time !== "string"
  ) {
    return null;
  }
  return {
    id: value.event_id,
    name: value.event_name,
    startTime: formatTime(value.start_time),
    venue: value.venue,
  };
}

function toSpot(value: unknown): AssignmentGatheringSpot | null {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.gathering_spot_id) ||
    typeof value.gathering_spot_name !== "string"
  ) {
    return null;
  }
  return { id: value.gathering_spot_id, name: value.gathering_spot_name };
}

function toGathering(value: unknown): AssignmentGathering | null {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.gathering_id) ||
    !isPositiveInteger(value.event_id) ||
    !isPositiveInteger(value.gathering_spot_id) ||
    typeof value.gathering_time !== "string"
  ) {
    return null;
  }
  return {
    eventId: value.event_id,
    id: value.gathering_id,
    spotId: value.gathering_spot_id,
    time: value.gathering_time,
  };
}

function toMemberUserId(value: unknown): number | null {
  return isRecord(value) && isPositiveInteger(value.user_id)
    ? value.user_id
    : null;
}

function parseCreatedGatheringId(value: unknown) {
  if (!isRecord(value) || !isPositiveInteger(value.gathering_id)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  return value.gathering_id;
}

function formatTime(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

function uniqueIds(ids: readonly number[]) {
  return Array.from(new Set(ids));
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
