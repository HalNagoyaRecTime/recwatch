import { useMemo, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";

type TeacherFormProps = {
  classRooms: readonly ClassRoomOption[];
  initialTeacher?: TeacherRow;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: {
    classRoomIds: number[];
    isLiveActive: boolean;
    userName: string;
  }) => void;
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
  const [isLiveActive, setIsLiveActive] = useState(
    initialTeacher?.isLiveActive ?? true
  );
  const [classRoomIds, setClassRoomIds] = useState<number[]>(
    () =>
      initialTeacher?.classRooms.map((classRoom) => classRoom.classRoomId) ?? []
  );
  const selectedClassRooms = useMemo(
    () =>
      classRooms.filter((classRoom) =>
        classRoomIds.includes(classRoom.classRoomId)
      ),
    [classRooms, classRoomIds]
  );

  function toggleClassRoom(classRoomId: number) {
    setClassRoomIds((current) =>
      current.includes(classRoomId)
        ? current.filter((id) => id !== classRoomId)
        : [...current, classRoomId]
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ classRoomIds, isLiveActive, userName: userName.trim() });
      }}
    >
      <label className="text-text-base block text-sm font-medium">
        先生名
        <input
          className="border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1 h-10 w-full rounded-md border px-3 outline-none"
          onChange={(event) => setUserName(event.target.value)}
          required
          value={userName}
        />
      </label>

      <label className="text-text-base flex items-center gap-2 text-sm font-medium">
        <input
          checked={isLiveActive}
          className="size-4"
          onChange={(event) => setIsLiveActive(event.target.checked)}
          type="checkbox"
        />
        有効な教官として扱う
      </label>

      <fieldset className="text-text-base space-y-2 text-sm">
        <legend className="font-medium">担当クラス</legend>
        <div className="border-border-base bg-surface-base max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
          {classRooms.map((classRoom) => (
            <label
              className="hover:bg-surface-hover flex items-center gap-2 rounded px-2 py-1.5"
              key={classRoom.classRoomId}
            >
              <input
                checked={classRoomIds.includes(classRoom.classRoomId)}
                className="size-4"
                onChange={() => toggleClassRoom(classRoom.classRoomId)}
                type="checkbox"
              />
              {classRoom.className}
            </label>
          ))}
          {classRooms.length === 0 ? (
            <p className="text-text-muted px-2 py-1">クラスがありません。</p>
          ) : null}
        </div>
      </fieldset>

      <p className="text-text-muted text-sm">
        選択中:{" "}
        {selectedClassRooms
          .map((classRoom) => classRoom.className)
          .join("、") || "なし"}
      </p>

      {submitError ? (
        <p
          aria-live="polite"
          className="text-tone-danger-text text-sm"
          role="alert"
        >
          {submitError}
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
