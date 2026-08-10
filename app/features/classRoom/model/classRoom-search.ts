import type { classRoomData } from "~/features/classRoom/model/classRoom";

export function filterClassRooms(
  classRooms: classRoomData[],
  query: string
): classRoomData[] {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) {
    return classRooms;
  }

  return classRooms.filter((classRoom) => {
    const searchableText = [classRoom.ClassRoomCode, classRoom.ClassRoomName]
      .join(" ")
      .normalize("NFKC")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}
