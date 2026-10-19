import type { ClassRoomData } from "~/features/classRoom/model/classRoom";

export function filterClassRooms(
  classRooms: ClassRoomData[],
  query: string
): ClassRoomData[] {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) {
    return classRooms;
  }

  return classRooms.filter((classRoom) => {
    const searchableText = [
      classRoom.classRoomCode,
      classRoom.classRoomName,
      classRoom.teacherName ?? "",
    ]
      .join(" ")
      .normalize("NFKC")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}
