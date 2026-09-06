import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  parseTeacherListUrl,
  updateTeacherListUrl,
} from "~/features/teachers/application/teacher-list-url";
import { teacherCreateTarget } from "~/features/teachers/application/teacher-navigation";
import { Select } from "~/components/ui/form/Select";
import type { TeacherBooleanFilter } from "~/features/teachers/api";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";

type TeachersPageProps = {
  classRooms?: readonly ClassRoomOption[];
  limit: number;
  offset: number;
  teachers: TeacherRow[];
  total: number;
};

export function TeachersPage({
  classRooms = [],
  limit,
  offset,
  teachers,
  total,
}: TeachersPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    search: query,
    classRoomId,
    sortBy,
    sortOrder,
    isStaff,
    isLiveActive,
  } = parseTeacherListUrl(searchParams);
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateTeacherListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateSearchParams(
    updates: Parameters<typeof updateTeacherListUrl>[1]
  ) {
    setSearchParams(updateTeacherListUrl(searchParams, updates));
  }

  function handleQueryChange(nextQuery: string) {
    updateSearchParams({ page: 1, search: nextQuery });
  }

  function handlePageChange(nextPage: number) {
    updateSearchParams({ page: nextPage });
  }

  function handleSortChange(columnId: string) {
    const sortColumns = {
      "teacher-id": "teacherId",
      "display-name": "displayName",
      "class-code": "classCode",
      "class-name": "className",
    } as const;
    const nextSortBy = sortColumns[columnId as keyof typeof sortColumns];
    if (!nextSortBy) return;
    const nextSortOrder =
      sortBy === nextSortBy && sortOrder === "asc" ? "desc" : "asc";
    updateSearchParams({
      page: 1,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
    });
  }

  function handleFilterChange(
    key: "isStaff" | "isLiveActive",
    value: TeacherBooleanFilter
  ) {
    updateSearchParams({ page: 1, [key]: value });
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <ImportUploadTrigger showHelperText={false} type="teachers" />
            <Button
              icon={Plus}
              onClick={() => navigate(teacherCreateTarget(location.search))}
              size="lg"
              variant="primary"
            >
              新規登録
            </Button>
          </div>
        }
        description="教官の基本情報を管理します"
        title="教官管理"
      />
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          ariaLabel="教官を検索"
          className="max-w-xl"
          onValueChange={handleQueryChange}
          placeholder="氏名・クラス名で検索..."
          value={query}
        />
        <Select
          ariaLabel="担当クラスフィルター"
          onValueChange={(value) =>
            updateSearchParams({
              page: 1,
              classRoomId: value === "all" ? null : Number(value),
            })
          }
          options={[
            { label: "クラス:すべて", value: "all" },
            ...classRooms.map((classRoom) => ({
              label: classRoom.classCode
                ? `${classRoom.classCode} ${classRoom.className}`
                : classRoom.className,
              value: String(classRoom.classRoomId),
            })),
          ]}
          value={classRoomId ? String(classRoomId) : "all"}
        />
        <Select
          ariaLabel="職員兼務フィルター"
          onValueChange={(value) => handleFilterChange("isStaff", value)}
          options={booleanFilterOptions("職員")}
          value={isStaff}
        />
        <Select
          ariaLabel="有効状態フィルター"
          onValueChange={(value) => handleFilterChange("isLiveActive", value)}
          options={booleanFilterOptions("有効")}
          value={isLiveActive}
        />
      </div>
      <TeacherTable
        items={teachers}
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? {
                columnId:
                  sortBy === "teacherId"
                    ? "teacher-id"
                    : sortBy === "displayName"
                      ? "display-name"
                      : sortBy === "classCode"
                        ? "class-code"
                        : "class-name",
                direction: sortOrder ?? "asc",
              }
            : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={total}
          />
        }
      />
    </div>
  );
}

function booleanFilterOptions(label: string) {
  return [
    { label: `${label}:すべて`, value: "all" as const },
    { label: `${label}:はい`, value: "true" as const },
    { label: `${label}:いいえ`, value: "false" as const },
  ];
}
