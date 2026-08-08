import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";

export function TeachersPage({ teachers }: { teachers: TeacherRow[] }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") ?? "";
  const [sort, setSort] = useState<DataTableSort>({
    columnId: "teacher-id",
    direction: "asc",
  });

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return teachers;

    return teachers.filter((teacher) => {
      const haystack = [
        teacher.displayName,
        ...teacher.classRooms.map((classRoom) => classRoom.className),
      ]
        .join(" ")
        .toLocaleLowerCase("ja");
      return haystack.includes(normalizedQuery);
    });
  }, [query, teachers]);

  const sortedTeachers = useMemo(() => {
    return [...filteredTeachers].sort((left, right) => {
      const comparison = getSortValue(left, sort.columnId).localeCompare(
        getSortValue(right, sort.columnId),
        "ja",
        { numeric: true }
      );
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredTeachers, sort]);

  function handleSearchChange(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("search", value);
    else next.delete("search");
    setSearchParams(next, { replace: true });
  }

  function handleSortChange(columnId: string) {
    setSort((current) =>
      current.columnId === columnId
        ? {
            columnId,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { columnId, direction: "asc" }
    );
  }

  return (
    <section className="flex min-h-full w-full flex-col gap-5">
      <PageHeader
        actions={
          <Button
            icon={Plus}
            onClick={() =>
              navigate({
                pathname: "/teachers/new",
                search: toSearchString(searchParams),
              })
            }
            size="lg"
            variant="primary"
          >
            新規登録
          </Button>
        }
        description="教官のIDと教官名を管理します"
        title="教官管理"
      />
      <SearchField
        ariaLabel="教官を検索"
        onValueChange={handleSearchChange}
        placeholder="教官名・担当クラスで検索"
        value={query}
      />
      <TeacherTable
        items={sortedTeachers}
        onSortChange={handleSortChange}
        sort={sort}
      />
    </section>
  );
}

function getSortValue(teacher: TeacherRow, columnId: string) {
  switch (columnId) {
    case "display-name":
      return teacher.displayName;
    case "class-rooms":
      return teacher.classRooms
        .map((classRoom) => classRoom.className)
        .join(" ");
    case "teacher-id":
    default:
      return String(teacher.teacherId);
  }
}

function toSearchString(searchParams: URLSearchParams) {
  const search = searchParams.toString();
  return search ? `?${search}` : "";
}
