import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { FormModal } from "~/components/ui/modal/FormModal";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  StudentApi,
  type StudentBooleanFilter,
  type StudentListQuery,
  type StudentListSortBy,
  type StudentManagementApi,
} from "~/features/students/api";
import {
  parseStudentListUrl,
  updateStudentListUrl,
} from "~/features/students/application/student-list-url";
import { StudentForm } from "~/features/students/components/StudentForm";
import { StudentTable } from "~/features/students/components/StudentTable";
import {
  userManagementApi,
  type UserManagementApi as UserManagementApiContract,
} from "~/features/user-management/api";
import type {
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";
import { getErrorMessage } from "~/lib/client-error";

type StudentsPageProps = {
  api?: StudentManagementApi;
  loadClassRooms?: () => Promise<ClassRoomData[]>;
  limit?: number;
  onRevalidate?: () => Promise<void>;
  offset?: number;
  students?: StudentRow[];
  total?: number;
  userApi?: UserManagementApiContract;
};

export function StudentsPage({
  api = StudentApi,
  loadClassRooms = getClassRoomData,
  limit: initialLimit,
  onRevalidate,
  offset: initialOffset,
  students: initialStudents,
  total: initialTotal,
  userApi = userManagementApi,
}: StudentsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<StudentRow[]>(initialStudents ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [classRooms, setClassRooms] = useState<ClassRoomData[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(initialStudents === undefined);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutationLock = useRef(false);
  const {
    search,
    page,
    classRoomId,
    sortBy,
    sortOrder,
    isStaff,
    isLiveActive,
  } = parseStudentListUrl(searchParams);
  const limit = initialLimit ?? 50;
  const offset = initialOffset ?? (page - 1) * limit;
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const buildStudentListQuery = useCallback(
    (): StudentListQuery => ({
      limit,
      offset,
      search: search || undefined,
      classRoomId: classRoomId ?? undefined,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
      isStaff,
      isLiveActive,
    }),
    [
      classRoomId,
      isLiveActive,
      isStaff,
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = window.setTimeout(() => {
      setSearchParams(
        updateStudentListUrl(searchParams, {
          page: 1,
          search: searchInput,
        })
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, searchParams, setSearchParams]);

  useEffect(() => {
    let isCurrent = true;

    loadClassRooms()
      .then((loadedClassRooms) => {
        if (isCurrent) setClassRooms(loadedClassRooms);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            getErrorMessage(error, "クラス一覧の取得に失敗しました。")
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loadClassRooms]);

  useEffect(() => {
    if (initialStudents !== undefined) {
      setStudents(initialStudents);
      setTotal(initialTotal ?? initialStudents.length);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    api
      .getStudents(buildStudentListQuery())
      .then((result) => {
        if (!isCurrent) return;
        setStudents(result.items);
        setTotal(result.total);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            getErrorMessage(error, "学生一覧の取得に失敗しました。")
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [
    api,
    initialStudents,
    initialTotal,
    isLiveActive,
    isStaff,
    limit,
    offset,
    search,
    classRoomId,
    sortBy,
    sortOrder,
    buildStudentListQuery,
  ]);

  useEffect(() => {
    if (isLoading || currentPage <= pageCount) return;
    setSearchParams(updateStudentListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, isLoading, pageCount, searchParams, setSearchParams]);

  function updateSearchParams(
    updates: Parameters<typeof updateStudentListUrl>[1]
  ) {
    setSearchParams(updateStudentListUrl(searchParams, updates));
  }

  function handleSortChange(columnId: string) {
    const sortColumns: Record<string, StudentListSortBy> = {
      "student-id": "studentId",
      "student-number": "studentIdNumber",
      "display-name": "displayName",
      staff: "isStaff",
      active: "isLiveActive",
      "class-code": "classCode",
      "class-name": "className",
      "attendance-number": "attendanceNumber",
    };
    const nextSortBy = sortColumns[columnId];
    if (!nextSortBy) return;

    setSearchParams((currentSearchParams) => {
      const currentState = parseStudentListUrl(currentSearchParams);
      const nextSortOrder =
        currentState.sortBy === nextSortBy && currentState.sortOrder === "asc"
          ? "desc"
          : "asc";
      return updateStudentListUrl(currentSearchParams, {
        page: 1,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });
    });
  }

  function handleFilterChange(
    key: "isStaff" | "isLiveActive",
    value: StudentBooleanFilter
  ) {
    updateSearchParams({ page: 1, [key]: value });
  }

  function openCreateForm() {
    setEditingStudent(null);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function openEditForm(student: StudentRow) {
    setEditingStudent(student);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingStudent(null);
    setSubmitError(null);
  }

  async function refreshStudentList() {
    if (onRevalidate) {
      await onRevalidate();
      return;
    }

    const refreshed = await api.getStudents(buildStudentListQuery());
    setStudents(refreshed.items);
    setTotal(refreshed.total);
    setLoadError(null);
  }

  function beginMutation() {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setIsMutating(true);
    setSubmitError(null);
    return true;
  }

  function endMutation() {
    mutationLock.current = false;
    setIsMutating(false);
  }

  async function saveStudent(input: StudentWriteInput) {
    if (!beginMutation()) return;
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.studentId, input);
      } else {
        await api.createStudent(input);
      }

      await refreshStudentList();
      closeForm();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "学生を保存できませんでした。"));
    } finally {
      endMutation();
    }
  }

  async function updateStudentActive(
    student: StudentRow,
    isLiveActive: boolean
  ) {
    if (!beginMutation()) return;
    try {
      await userApi.updateUserStatus(student.userId, isLiveActive);
      await refreshStudentList();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "学生の有効状態を更新できませんでした。")
      );
    } finally {
      endMutation();
    }
  }

  async function updateStudentStaff(student: StudentRow, isStaff: boolean) {
    if (!beginMutation()) return;
    try {
      if (isStaff) {
        await userApi.grantStaff(student.userId);
      } else {
        await userApi.revokeStaff(student.userId);
      }
      await refreshStudentList();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "学生のstaff状態を更新できませんでした。")
      );
    } finally {
      endMutation();
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <ImportUploadTrigger showHelperText={false} type="students" />
            <Button
              disabled={isLoading}
              icon={Plus}
              onClick={openCreateForm}
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
              label: `${classRoom.classRoomCode} ${classRoom.classRoomName}`,
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

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : null}

      <StudentTable
        emptyMessage={
          isLoading
            ? "学生を読み込んでいます..."
            : search
              ? "検索条件に一致する学生が見つかりません。"
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
        isMutating={isMutating}
        items={students}
        onChangeActive={updateStudentActive}
        onChangeStaff={updateStudentStaff}
        onEdit={openEditForm}
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? { columnId: sortColumnId(sortBy), direction: sortOrder ?? "asc" }
            : undefined
        }
      />

      {!isFormOpen && submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      {isFormOpen ? (
        <FormModal
          description="氏名、学籍番号、出席番号、所属クラスを入力します"
          onClose={closeForm}
          title={editingStudent ? "学生を編集" : "学生の新規登録"}
        >
          <StudentForm
            classRooms={classRooms}
            initialStudent={editingStudent ?? undefined}
            isSubmitting={isMutating}
            onCancel={closeForm}
            onSubmit={saveStudent}
            submitError={submitError}
          />
        </FormModal>
      ) : null}
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
