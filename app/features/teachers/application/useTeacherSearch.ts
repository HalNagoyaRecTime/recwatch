import { useMemo, useState } from "react";

import type { TeacherRow } from "~/features/teachers/model/teacher";

export function useTeacherSearch(teachers: readonly TeacherRow[]) {
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return teachers;

    return teachers.filter((teacher) => {
      const haystack = [
        teacher.displayName,
        ...teacher.classRooms.map((classRoom) => classRoom.className),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, teachers]);

  return { filteredTeachers, query, setQuery };
}
