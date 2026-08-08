import { Plus, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useRevalidator, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeachersPageProps = {
  limit: number;
  offset: number;
  teachers: TeacherRow[];
  total: number;
};

export function TeachersPage({
  limit,
  offset,
  teachers,
  total,
}: TeachersPageProps) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") ?? "";
  const sort = getSortFromParams(searchParams);

  const sortedTeachers = useMemo(() => {
    if (sort.columnId !== "class-rooms") return teachers;
    return [...teachers].sort((left, right) =>
      compareTeachersByClassRooms(left, right, sort.direction)
    );
  }, [sort, teachers]);

  function handleSearchChange(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("search", value);
    else next.delete("search");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  function handleSortChange(columnId: string) {
    const next = new URLSearchParams(searchParams);
    const current = getSortFromParams(searchParams);
    const nextDirection =
      current.columnId === columnId && current.direction === "asc"
        ? "desc"
        : "asc";
    next.set("sortBy", toSortParam(columnId));
    next.set("sortOrder", nextDirection);
    next.set("page", "1");
    setSearchParams(next);
  }

  function handlePageChange(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
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
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchField
            ariaLabel="教官を検索"
            onValueChange={handleSearchChange}
            placeholder="教官名・担当クラスで検索"
            value={query}
          />
        </div>
        <Button
          aria-label="教官一覧を再読み込み"
          disabled={revalidator.state === "loading"}
          icon={RefreshCw}
          iconOnly
          onClick={() => revalidator.revalidate()}
          title="教官一覧を再読み込み"
          variant="secondary"
        />
      </div>
      <TeacherTable
        footer={
          <Pagination
            currentPage={Math.floor(offset / limit) + 1}
            onPageChange={handlePageChange}
            pageCount={Math.max(1, Math.ceil(total / limit))}
            pageSize={limit}
            totalItems={total}
          />
        }
        items={sortedTeachers}
        onSortChange={handleSortChange}
        sort={sort}
      />
    </section>
  );
}

function getSortFromParams(searchParams: URLSearchParams): DataTableSort {
  const sortBy = searchParams.get("sortBy");
  const columnId =
    sortBy === "displayName"
      ? "display-name"
      : sortBy === "classRoom"
        ? "class-rooms"
        : "teacher-id";
  return {
    columnId,
    direction: searchParams.get("sortOrder") === "desc" ? "desc" : "asc",
  };
}

function toSortParam(columnId: string) {
  switch (columnId) {
    case "display-name":
      return "displayName";
    case "class-rooms":
      return "classRoom";
    case "teacher-id":
    default:
      return "teacherId";
  }
}

function compareTeachersByClassRooms(
  left: TeacherRow,
  right: TeacherRow,
  direction: "asc" | "desc"
) {
  const leftKey = getClassRoomSortKey(left);
  const rightKey = getClassRoomSortKey(right);

  if (leftKey === null || rightKey === null) {
    if (leftKey === rightKey) return left.teacherId - right.teacherId;
    return leftKey === null ? 1 : -1;
  }

  const comparison = leftKey.localeCompare(rightKey, "ja", { numeric: true });
  if (comparison !== 0) return direction === "asc" ? comparison : -comparison;
  return left.teacherId - right.teacherId;
}

function getClassRoomSortKey(teacher: TeacherRow) {
  if (teacher.classRooms.length === 0) return null;
  return [...teacher.classRooms]
    .sort((left, right) =>
      `${left.classCode}\u0000${left.className}`.localeCompare(
        `${right.classCode}\u0000${right.className}`,
        "ja",
        { numeric: true }
      )
    )
    .map((classRoom) => `${classRoom.classCode}\u0000${classRoom.className}`)
    .join("\u0001");
}

function toSearchString(searchParams: URLSearchParams) {
  const search = searchParams.toString();
  return search ? `?${search}` : "";
}
