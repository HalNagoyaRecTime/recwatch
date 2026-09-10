import { Check, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import type {
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

type StudentFormProps = {
  classRooms: readonly ClassRoomData[];
  initialStudent?: StudentRow;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: StudentWriteInput) => void | Promise<void>;
  submitError: string | null;
};

export function StudentForm({
  classRooms,
  initialStudent,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
}: StudentFormProps) {
  const [displayName, setDisplayName] = useState(
    initialStudent?.displayName ?? ""
  );
  const [studentIdNumber, setStudentIdNumber] = useState(
    initialStudent?.studentIdNumber ?? ""
  );
  const [attendanceNumber, setAttendanceNumber] = useState(
    initialStudent ? String(initialStudent.attendanceNumber) : ""
  );
  const [classRoomId, setClassRoomId] = useState(
    initialStudent &&
      classRooms.some(
        (classRoom) =>
          classRoom.classRoomId === initialStudent.classRoom.classRoomId
      )
      ? String(initialStudent.classRoom.classRoomId)
      : ""
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAttendanceNumber = Number(attendanceNumber);
    const parsedClassRoomId = Number(classRoomId);
    const normalizedName = displayName.trim();
    const normalizedStudentId = studentIdNumber.trim();

    if (
      !normalizedName ||
      !normalizedStudentId ||
      !Number.isInteger(parsedAttendanceNumber) ||
      parsedAttendanceNumber <= 0 ||
      !Number.isInteger(parsedClassRoomId) ||
      parsedClassRoomId <= 0
    ) {
      setValidationError("必須項目を正しく入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit({
      attendanceNumber: parsedAttendanceNumber,
      classRoomId: parsedClassRoomId,
      displayName: normalizedName,
      studentIdNumber: normalizedStudentId,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className={labelClassName}>
        氏名 <span className="text-tone-danger-text">*</span>
        <input
          aria-label="氏名*"
          className={inputClassName}
          disabled={isSubmitting}
          maxLength={100}
          onChange={(event) => setDisplayName(event.currentTarget.value)}
          value={displayName}
        />
      </label>

      {initialStudent ? (
        <div aria-label="学生の状態" className="flex flex-wrap gap-2">
          <Button
            disabled
            icon={initialStudent.isLiveActive ? Check : X}
            size="sm"
            type="button"
            variant={initialStudent.isLiveActive ? "success" : "secondary"}
          >
            {`アクティブ: ${initialStudent.isLiveActive ? "有効" : "無効"}`}
          </Button>
          <Button
            disabled
            icon={initialStudent.isStaff ? Check : X}
            size="sm"
            type="button"
            variant={initialStudent.isStaff ? "success" : "secondary"}
          >
            {`スタッフ: ${initialStudent.isStaff ? "staff" : "staffではない"}`}
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          学籍番号 <span className="text-tone-danger-text">*</span>
          <input
            aria-label="学籍番号*"
            className={inputClassName}
            disabled={isSubmitting}
            maxLength={100}
            onChange={(event) => setStudentIdNumber(event.currentTarget.value)}
            value={studentIdNumber}
          />
        </label>
        <label className={labelClassName}>
          出席番号 <span className="text-tone-danger-text">*</span>
          <input
            aria-label="出席番号*"
            className={inputClassName}
            disabled={isSubmitting}
            min={1}
            onChange={(event) => setAttendanceNumber(event.currentTarget.value)}
            type="number"
            value={attendanceNumber}
          />
        </label>
      </div>
      <label className={labelClassName}>
        クラス <span className="text-tone-danger-text">*</span>
        <select
          aria-label="クラス*"
          className={inputClassName}
          disabled={isSubmitting}
          onChange={(event) => setClassRoomId(event.currentTarget.value)}
          value={classRoomId}
        >
          <option value="">クラスを選択</option>
          {classRooms.map((classRoom) => (
            <option key={classRoom.classRoomId} value={classRoom.classRoomId}>
              {classRoom.classRoomName}
            </option>
          ))}
        </select>
      </label>

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

const labelClassName = "text-text-base block text-sm font-medium";
const inputClassName =
  "border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-10 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-50";
