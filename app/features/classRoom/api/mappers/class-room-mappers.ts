import type { ClassRoom } from "~/features/classRoom/model/classRoom";
import type {
  ClassRoomDTO,
  ClassRoomWriteDTO,
} from "~/features/classRoom/api/dto/class-room-dto";
import type {
  ClassRoomPage,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";

export function toClassRoom(dto: ClassRoomDTO): ClassRoom {
  return {
    classRoomId: dto.class_room_id,
    classCode: dto.class_code,
    className: dto.class_name,
    studentCount: dto.student_count,
    teacher: dto.teacher
      ? {
          teacherId: dto.teacher.teacher_id,
          userId: dto.teacher.user_id,
          displayName: dto.teacher.display_name,
        }
      : null,
  };
}

export function toClassRoomPage(dto: unknown): ClassRoomPage {
  if (!dto || typeof dto !== "object") {
    throw new Error("クラス一覧APIのレスポンス形式が不正です。");
  }
  const value = dto as {
    items?: unknown;
    total?: unknown;
    limit?: unknown;
    offset?: unknown;
  };
  const items = Array.isArray(value.items) ? value.items : null;
  const total = value.total;
  const limit = value.limit;
  const offset = value.offset;
  if (
    !items ||
    !items.every(isClassRoomDTO) ||
    !isInteger(total) ||
    total < 0 ||
    !isInteger(limit) ||
    limit < 1 ||
    !isInteger(offset) ||
    offset < 0
  ) {
    throw new Error("クラス一覧APIのレスポンス形式が不正です。");
  }

  return {
    items: items.map((item) => toClassRoom(item)),
    total,
    limit,
    offset,
  };
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function isClassRoomDTO(value: unknown): value is ClassRoomDTO {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null;
  if (
    !record ||
    !isInteger(record.class_room_id) ||
    typeof record.class_code !== "string" ||
    typeof record.class_name !== "string" ||
    !isInteger(record.student_count) ||
    record.student_count < 0
  ) {
    return false;
  }

  if (record.teacher === null) return true;
  const teacher =
    typeof record.teacher === "object" && record.teacher !== null
      ? (record.teacher as Record<string, unknown>)
      : null;
  return (
    teacher !== null &&
    isInteger(teacher.teacher_id) &&
    isInteger(teacher.user_id) &&
    typeof teacher.display_name === "string"
  );
}

export function toClassRoomWriteDTO(
  input: ClassRoomWriteInput
): ClassRoomWriteDTO {
  return {
    classCode: input.classCode,
    className: input.className,
    teacherId: input.teacherId,
  };
}
