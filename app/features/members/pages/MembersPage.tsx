import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { Select } from "~/components/ui/form/Select";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { getErrorMessage } from "~/lib/client-error";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  StudentApi,
  type StudentBooleanFilter,
  type StudentDTO,
  type StudentListSortBy,
  type StudentManagementApi,
  type StudentWriteInput,
} from "~/features/members/api";
import {
  parseStudentListUrl,
  updateStudentListUrl,
} from "~/features/members/application/student-list-url";
import { StudentForm } from "~/features/members/components/StudentForm";
import { StudentTable } from "~/features/members/components/StudentTable";
import { UserManagementTabs } from "~/features/user-management/components/UserManagementTabs";
import { FormModal } from "~/components/ui/modal/FormModal";

type MembersPageProps = {
  api?: StudentManagementApi;
  loadClassRooms?: () => Promise<ClassRoomData[]>;
  limit?: number;
  offset?: number;
  students?: StudentDTO[];
  total?: number;
};

export function MembersPage({
  api = StudentApi,
  loadClassRooms = getClassRoomData,
  limit: initialLimit,
  offset: initialOffset,
  students: initialStudents,
  total: initialTotal,
}: MembersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<StudentDTO[]>(initialStudents ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [classRooms, setClassRooms] = useState<ClassRoomData[]>([]);
  const [editingStudent, setEditingStudent] = useState<StudentDTO | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(initialStudents === undefined);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { search, page, sortBy, sortOrder, isStaff, isLiveActive } =
    parseStudentListUrl(searchParams);
  const limit = initialLimit ?? 50;
  const offset = initialOffset ?? (page - 1) * limit;
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

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
      .getStudents({
        limit,
        offset,
        search: search || undefined,
        sortBy: sortBy ?? undefined,
        sortOrder: sortOrder ?? undefined,
        isStaff,
        isLiveActive,
      })
      .then((result) => {
        if (!isCurrent) return;
        setStudents(result.items);
        setTotal(result.total);
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
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateStudentListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

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
      "class-code": "classCode",
      "class-name": "className",
      "attendance-number": "attendanceNumber",
    };
    const nextSortBy = sortColumns[columnId];
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
    value: StudentBooleanFilter
  ) {
    updateSearchParams({ page: 1, [key]: value });
  }

  function openCreateForm() {
    setEditingStudent(null);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingStudent(null);
    setSubmitError(null);
  }

  function openEditForm(student: StudentDTO) {
    setEditingStudent(student);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  async function saveStudent(input: StudentWriteInput) {
    if (isMutating) return;
    setIsMutating(true);
    setSubmitError(null);
    try {
      const saved = editingStudent
        ? await api.updateStudent(editingStudent.student_id, input)
        : await api.createStudent(input);
      setStudents((current) =>
        editingStudent
          ? current.map((student) =>
              student.student_id === saved.student_id ? saved : student
            )
          : [...current, saved]
      );
      if (!editingStudent) setTotal((current) => current + 1);
      closeForm();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "学生を保存できませんでした。"));
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteStudent(student: StudentDTO) {
    if (
      isMutating ||
      !window.confirm(
        `「${student.display_name}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    setIsMutating(true);
    setSubmitError(null);
    try {
      await api.deleteStudent(student.student_id);
      setStudents((current) =>
        current.filter((item) => item.student_id !== student.student_id)
      );
      setTotal((current) => Math.max(0, current - 1));
    } catch (error) {
      setSubmitError(getErrorMessage(error, "学生を削除できませんでした。"));
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        description="学生の基本情報と所属クラスを管理します"
        title="学生管理"
      />
      <ImportUploadTrigger
        adjacentAction={
          <Button
            disabled={isLoading || classRooms.length === 0}
            icon={Plus}
            onClick={openCreateForm}
            variant="secondary"
          >
            新規登録
          </Button>
        }
        helperText="取り込み前にプレビューで内容・データ種別を確認できます"
        type="students"
      />
      <UserManagementTabs active="students" />
      <SearchField
        ariaLabel="学生を検索"
        onValueChange={(value) =>
          updateSearchParams({ page: 1, search: value })
        }
        placeholder="氏名・学籍番号・クラスで検索..."
        value={search}
      />
      <div className="flex flex-wrap gap-3">
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
        isMutating={isMutating}
        items={students}
        onDelete={(student) => void deleteStudent(student)}
        onEdit={openEditForm}
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? { columnId: sortColumnId(sortBy), direction: sortOrder ?? "asc" }
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
