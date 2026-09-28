import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import type {
  StudentAccessMutationApi,
  StudentListSortBy,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
import { StudentTable } from "~/features/students/components/StudentTable";
import { useStudentListUrl } from "~/features/students/hooks/useStudentListUrl";
import type {
  StudentClassRoomOption,
  StudentRow,
} from "~/features/students/model/student";

type StudentsPageProps = {
  api: StudentMutationApi;
  classRooms: readonly StudentClassRoomOption[];
  limit: number;
  onRevalidate: () => Promise<void> | void;
  offset: number;
  students: readonly StudentRow[];
  total: number;
  userApi: StudentAccessMutationApi;
};

export function StudentsPage({
  api,
  classRooms,
  limit,
  onRevalidate,
  offset,
  students,
  total,
  userApi,
}: StudentsPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    error: submitError,
    isMutating,
    updateActive,
    updateStaff,
  } = useStudentMutation({ api, onRevalidate, userApi });
  const {
    search,
    classRoomId,
    sortBy,
    sortOrder,
    isStaff,
    isLiveActive,
    handleFilterChange,
    handleSortChange,
    searchInput,
    setSearchInput,
    updateSearchParams,
  } = useStudentListUrl();
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    updateSearchParams({ page: pageCount }, true);
  }, [currentPage, pageCount, updateSearchParams]);

  async function updateStudentActive(
    student: StudentRow,
    isLiveActive: boolean
  ) {
    await updateActive(student, isLiveActive);
  }

  async function updateStudentStaff(student: StudentRow, isStaff: boolean) {
    await updateStaff(student, isStaff);
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <ImportUploadTrigger showHelperText={false} type="students" />
            <Button
              disabled={isMutating}
              icon={Plus}
              onClick={() =>
                navigate({ pathname: "/students/new", search: location.search })
              }
              size="lg"
              variant="primary"
            >
              新規登録
            </Button>
          </div>
        }
        description="学生の基本情報と所属クラスを管理します"
        title="学生管理"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">
          <SearchField
            ariaLabel="学生を検索"
            onValueChange={setSearchInput}
            placeholder="氏名・学籍番号・クラスで検索..."
            value={searchInput}
          />
        </div>
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
              label: `${classRoom.classCode} ${classRoom.className}`,
              value: String(classRoom.classRoomId),
            })),
          ]}
          value={classRoomId ? String(classRoomId) : "all"}
        />
        <Select
          ariaLabel="staffフィルター"
          onValueChange={(value) => handleFilterChange("isStaff", value)}
          options={booleanFilterOptions("staff")}
          value={isStaff}
        />
        <Select
          ariaLabel="有効状態フィルター"
          onValueChange={(value) => handleFilterChange("isLiveActive", value)}
          options={booleanFilterOptions("有効")}
          value={isLiveActive}
        />
      </div>

      {submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      <StudentTable
        emptyMessage={
          search ? "検索条件に一致する学生が見つかりません。" : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={total}
          />
        }
        isMutating={isMutating}
        items={students}
        onChangeActive={updateStudentActive}
        onChangeStaff={updateStudentStaff}
        onEdit={(student) =>
          navigate({
            pathname: `/students/${student.studentId}/edit`,
            search: location.search,
          })
        }
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? { columnId: sortColumnId(sortBy), direction: sortOrder ?? "asc" }
            : undefined
        }
      />
    </div>
  );
}

function sortColumnId(sortBy: StudentListSortBy) {
  return {
    studentId: "student-id",
    studentIdNumber: "student-number",
    displayName: "display-name",
    isStaff: "staff",
    isLiveActive: "active",
    classCode: "class-code",
    className: "class-name",
    attendanceNumber: "attendance-number",
  }[sortBy];
}

function booleanFilterOptions(label: string) {
  return [
    { label: `${label}:すべて`, value: "all" as const },
    { label: `${label}:はい`, value: "true" as const },
    { label: `${label}:いいえ`, value: "false" as const },
  ];
}
