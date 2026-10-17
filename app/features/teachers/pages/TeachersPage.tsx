import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button/Button";
import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  teacherCreateTarget,
  teacherEditTarget,
} from "~/features/teachers/application/teacher-navigation";
import { Select } from "~/components/ui/form/Select";
import type { TeacherMutationApi } from "~/features/teachers/api/contracts/teacher-api";
import { useTeacherMutation } from "~/features/teachers/hooks/useTeacherMutation";
import { useTeacherListUrl } from "~/features/teachers/hooks/useTeacherListUrl";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";

type TeachersPageProps = {
  api: TeacherMutationApi;
  classRooms: readonly ClassRoomOption[];
  classRoomOptions?: ManagementOptionState<ClassRoomOption>;
  limit: number;
  offset: number;
  onRevalidate: () => Promise<void> | void;
  teachers: TeacherRow[];
  total: number;
};

export function TeachersPage({
  api,
  classRoomOptions,
  classRooms,
  limit,
  offset,
  onRevalidate,
  teachers,
  total,
}: TeachersPageProps) {
  const classRoomOptionState = classRoomOptions ?? readyOptions(classRooms);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearError, error, isMutating, updateActive, updateStaff } =
    useTeacherMutation({ api, onRevalidate });
  const {
    classRoomId,
    handleFilterChange,
    handleSortChange,
    isLiveActive,
    isStaff,
    searchInput,
    sortBy,
    sortOrder,
    setSearchInput,
    updateSearchParams,
  } = useTeacherListUrl();
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    updateSearchParams({ page: pageCount }, true);
  }, [currentPage, pageCount, updateSearchParams]);

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
        <div className="min-w-60 flex-1">
          <SearchField
            ariaLabel="教官を検索"
            onValueChange={setSearchInput}
            placeholder="氏名・クラス名で検索..."
            value={searchInput}
          />
        </div>
        <Select
          ariaLabel="担当クラスフィルター"
          disabled={
            classRoomOptionState.isLoading ||
            Boolean(classRoomOptionState.error)
          }
          onValueChange={(value) =>
            updateSearchParams({
              page: 1,
              classRoomId: value === "all" ? null : Number(value),
            })
          }
          options={[
            {
              label: classRoomOptionState.isLoading
                ? "クラス:読み込み中..."
                : "クラス:すべて",
              value: "all",
            },
            ...classRoomOptionState.items.map((classRoom) => ({
              label: classRoom.classCode
                ? `${classRoom.classCode} ${classRoom.className}`
                : classRoom.className,
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
      <ManagementOptionFeedback
        label="クラス候補"
        state={classRoomOptionState}
      />
      <TeacherTable
        items={teachers}
        isMutating={isMutating}
        onChangeActive={async (teacher) => {
          await updateActive(teacher.userId, !teacher.isLiveActive);
        }}
        onChangeStaff={async (teacher) => {
          await updateStaff(teacher.userId, !teacher.isStaff);
        }}
        onClearError={clearError}
        onEdit={(teacher) =>
          navigate(teacherEditTarget(teacher.teacherId, location.search))
        }
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? {
                columnId:
                  sortBy === "teacherId"
                    ? "teacher-id"
                    : sortBy === "displayName"
                      ? "display-name"
                      : sortBy === "isStaff"
                        ? "staff"
                        : sortBy === "isLiveActive"
                          ? "active"
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
            onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={total}
          />
        }
      />
      {error ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {error}
        </p>
      ) : null}
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

function readyOptions<T>(items: readonly T[]): ManagementOptionState<T> {
  return { error: null, isLoading: false, items };
}
