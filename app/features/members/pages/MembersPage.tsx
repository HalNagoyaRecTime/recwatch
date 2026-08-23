import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { FormModal } from "~/components/ui/modal/FormModal";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  StudentApi,
  type StudentDTO,
  type StudentManagementApi,
  type StudentWriteInput,
} from "~/features/members/api";
import { StudentForm } from "~/features/members/components/StudentForm";
import { StudentTable } from "~/features/members/components/StudentTable";
import { UserManagementTabs } from "~/features/user-management/components/UserManagementTabs";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

type MembersPageProps = {
  api?: StudentManagementApi;
  loadClassRooms?: () => Promise<ClassRoomData[]>;
};

export function MembersPage({
  api = StudentApi,
  loadClassRooms = getClassRoomData,
}: MembersPageProps) {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoomData[]>([]);
  const [query, setQuery] = useState("");
  const [editingStudent, setEditingStudent] = useState<StudentDTO | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sort, setSort] = useState<DataTableSort>();

  useEffect(() => {
    let isCurrent = true;

    Promise.all([api.getAllStudents(), loadClassRooms()])
      .then(([loadedStudents, loadedClassRooms]) => {
        if (!isCurrent) return;
        setStudents(loadedStudents);
        setClassRooms(loadedClassRooms);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "学生一覧の取得に失敗しました。"
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [api, loadClassRooms]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return students;

    return students.filter((student) =>
      [
        student.display_name,
        student.class_room_name,
        student.student_id_number,
        String(student.attendance_number),
      ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedQuery))
    );
  }, [query, students]);
  const visibleStudents = useMemo(
    () =>
      sortManagementTableItems(filteredStudents, sort, (student, columnId) => {
        switch (columnId) {
          case "student-id":
            return student.student_id;
          case "student-number":
            return student.student_id_number;
          case "display-name":
            return student.display_name;
          case "class-room":
            return student.class_room_name;
          case "attendance-number":
            return student.attendance_number;
          default:
            return null;
        }
      }),
    [filteredStudents, sort]
  );

  function openCreateForm() {
    setEditingStudent(null);
    setSubmitError(null);
    setIsFormOpen(true);
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
      setIsFormOpen(false);
      setEditingStudent(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "学生を保存できませんでした。"
      );
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
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "学生を削除できませんでした。"
      );
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
        onValueChange={setQuery}
        placeholder="氏名・学籍番号・クラスで検索..."
        value={query}
      />

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : null}

      <StudentTable
        emptyMessage={
          isLoading
            ? "学生を読み込んでいます..."
            : query
              ? "検索条件に一致する学生が見つかりません。"
              : undefined
        }
        isMutating={isMutating}
        items={visibleStudents}
        onDelete={(student) => void deleteStudent(student)}
        onEdit={openEditForm}
        onSortChange={(columnId) =>
          setSort((current) => getNextManagementTableSort(current, columnId))
        }
        sort={sort}
      />

      {!isFormOpen && submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      {isFormOpen ? (
        <FormModal
          description="氏名、学籍番号、出席番号、所属クラスを入力します"
          onClose={() => setIsFormOpen(false)}
          title={editingStudent ? "学生を編集" : "学生の新規登録"}
        >
          <StudentForm
            classRooms={classRooms}
            initialStudent={editingStudent ?? undefined}
            isSubmitting={isMutating}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={saveStudent}
            submitError={submitError}
          />
        </FormModal>
      ) : null}
    </div>
  );
}
