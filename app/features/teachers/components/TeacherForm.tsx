import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";

export type TeacherFormInput = {
  classRoomIds: number[];
  userName: string;
};

type TeacherFormProps = {
  classRooms: readonly ClassRoomOption[];
  initialTeacher?: TeacherRow;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: TeacherFormInput) => void | Promise<void>;
  submitError: string | null;
};

export function TeacherForm({
  classRooms,
  initialTeacher,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
}: TeacherFormProps) {
  const [userName, setUserName] = useState(initialTeacher?.displayName ?? "");
  const [classRoomIds, setClassRoomIds] = useState<number[]>(
    () =>
      initialTeacher?.classRooms.map((classRoom) => classRoom.classRoomId) ?? []
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function toggleClassRoom(classRoomId: number) {
    setClassRoomIds((current) =>
      current.includes(classRoomId)
        ? current.filter((id) => id !== classRoomId)
        : [...current, classRoomId]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = userName.trim();
    if (!normalizedName) {
      setValidationError("教官名を入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit({ classRoomIds, userName: normalizedName });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label
        className="block text-sm font-semibold"
        htmlFor="teacher-user-name"
      >
        先生名
        <input
          className="border-border-base bg-surface-base text-text-base mt-1 h-10 w-full rounded-md border px-3 outline-none"
          id="teacher-user-name"
          onChange={(event) => setUserName(event.target.value)}
          value={userName}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold">担当クラス</legend>
        <div className="border-border-base mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
          {classRooms.map((classRoom) => (
            <label
              className="hover:bg-surface-hover flex items-center gap-2 rounded px-2 py-2 text-sm"
              key={classRoom.classRoomId}
            >
              <input
                checked={classRoomIds.includes(classRoom.classRoomId)}
                onChange={() => toggleClassRoom(classRoom.classRoomId)}
                type="checkbox"
              />
              {classRoom.className}
            </label>
          ))}
          {classRooms.length === 0 ? (
            <p className="text-text-muted px-2 py-2 text-sm">
              担当クラスはありません。
            </p>
          ) : null}
        </div>
      </fieldset>

      {validationError || submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {validationError ?? submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">
          キャンセル
        </Button>
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
