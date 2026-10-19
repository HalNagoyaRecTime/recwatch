import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { FormModal } from "~/components/ui/modal/FormModal";
import {
  ClassRoomApi,
  type ClassRoomMutationApi,
  type ClassRoomWriteInput,
} from "~/features/classRoom/api";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { toClassRoomData } from "~/features/classRoom/model/classRoom";
import { filterClassRooms } from "~/features/classRoom/model/classRoom-search";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import { UserManagementTabs } from "~/features/user-management/components/UserManagementTabs";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

type TeacherOption = {
  teacherId: number;
  displayName: string;
};

type ClassRoomPageProps = {
  api?: ClassRoomMutationApi;
  classRooms: ClassRoomData[];
  teacherOptions: TeacherOption[];
};

const emptyForm: ClassRoomWriteInput = {
  classCode: "",
  className: "",
  teacherId: null,
};

export function ClassRoomPage({
  api = ClassRoomApi,
  classRooms,
  teacherOptions,
}: ClassRoomPageProps) {
  const [items, setItems] = useState(classRooms);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ClassRoomData | null>(null);
  const [form, setForm] = useState<ClassRoomWriteInput>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sort, setSort] = useState<DataTableSort>();
  const filteredClassRooms = useMemo(
    () => filterClassRooms(items, query),
    [items, query]
  );
  const visibleClassRooms = useMemo(
    () =>
      sortManagementTableItems(
        filteredClassRooms,
        sort,
        (classRoom, columnId) => {
          switch (columnId) {
            case "class-room-id":
              return classRoom.classRoomId;
            case "class-room-code":
              return classRoom.classRoomCode;
            case "class-room-name":
              return classRoom.classRoomName;
            case "teacher-name":
              return classRoom.teacherName;
            case "student-count":
              return classRoom.studentCount;
            default:
              return null;
          }
        }
      ),
    [filteredClassRooms, sort]
  );

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setActionError(null);
    setIsFormOpen(true);
  }

  function openEditForm(classRoom: ClassRoomData) {
    setEditing(classRoom);
    setForm({
      classCode: classRoom.classRoomCode,
      className: classRoom.classRoomName,
      teacherId: classRoom.teacherId,
    });
    setActionError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setActionError(null);
  }

  async function saveClassRoom() {
    const input = {
      classCode: form.classCode.trim(),
      className: form.className.trim(),
      teacherId: form.teacherId,
    };
    if (isMutating) return;

    if (!input.classCode || !input.className) {
      setActionError("クラス記号とクラス名を入力してください。");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    try {
      const response = editing
        ? await api.updateClassRoom(editing.classRoomId, input)
        : await api.createClassRoom(input);
      const saved = toClassRoomData(response);
      setItems((current) =>
        editing
          ? current.map((item) =>
              item.classRoomId === saved.classRoomId ? saved : item
            )
          : [...current, saved]
      );
      closeForm();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "クラスを保存できませんでした。"
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteClassRoom(classRoom: ClassRoomData) {
    if (
      isMutating ||
      !window.confirm(
        `「${classRoom.classRoomName}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    setIsMutating(true);
    setActionError(null);
    try {
      await api.deleteClassRoom(classRoom.classRoomId);
      setItems((current) =>
        current.filter((item) => item.classRoomId !== classRoom.classRoomId)
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "クラスを削除できませんでした。"
      );
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        title="クラス管理"
        description="クラスの基本情報と担当教官を管理します"
      />

      <ImportUploadTrigger
        type="classrooms"
        adjacentAction={
          <Button
            disabled={isMutating}
            icon={Plus}
            onClick={openCreateForm}
            size="md"
            type="button"
            variant="secondary"
          >
            新規登録
          </Button>
        }
        helperText="取り込み前にプレビューで内容・データ種別を確認できます"
      />

      {isFormOpen ? (
        <FormModal
          description="クラス記号、クラス名、担当教官を入力します"
          onClose={closeForm}
          title={editing ? "クラスを編集" : "クラスの新規登録"}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveClassRoom();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-text-base text-sm font-medium">
                クラス記号 <span className="text-tone-danger-text">*</span>
                <input
                  aria-label="クラス記号*"
                  className={inputClassName}
                  disabled={isMutating}
                  maxLength={50}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setForm((current) => ({ ...current, classCode: value }));
                  }}
                  value={form.classCode}
                />
              </label>
              <label className="text-text-base text-sm font-medium">
                クラス名 <span className="text-tone-danger-text">*</span>
                <input
                  aria-label="クラス名*"
                  className={inputClassName}
                  disabled={isMutating}
                  maxLength={100}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setForm((current) => ({ ...current, className: value }));
                  }}
                  value={form.className}
                />
              </label>
            </div>
            <label className="text-text-base block text-sm font-medium">
              担当教官
              <select
                aria-label="担当教官"
                className={inputClassName}
                disabled={isMutating}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setForm((current) => ({
                    ...current,
                    teacherId: value ? Number(value) : null,
                  }));
                }}
                value={form.teacherId ?? ""}
              >
                <option value="">未設定</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.displayName}
                  </option>
                ))}
              </select>
            </label>
            {actionError ? (
              <p className="text-tone-danger-text text-sm" role="alert">
                {actionError}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button
                disabled={isMutating}
                onClick={closeForm}
                type="button"
                variant="secondary"
              >
                キャンセル
              </Button>
              <Button disabled={isMutating} type="submit" variant="primary">
                {isMutating ? "保存中..." : "保存する"}
              </Button>
            </div>
          </form>
        </FormModal>
      ) : actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {actionError}
        </p>
      ) : null}

      <UserManagementTabs active="classrooms" />

      <SearchField
        ariaLabel="クラスを検索"
        onValueChange={setQuery}
        placeholder="クラス名・担当教官で検索..."
        value={query}
      />

      <ClassRoomTable
        classRooms={visibleClassRooms}
        isMutating={isMutating}
        onDelete={(classRoom) => void deleteClassRoom(classRoom)}
        onEdit={openEditForm}
        onSortChange={(columnId) =>
          setSort((current) => getNextManagementTableSort(current, columnId))
        }
        sort={sort}
      />
    </div>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-9 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-50";
