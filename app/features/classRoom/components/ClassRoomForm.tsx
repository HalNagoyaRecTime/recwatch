import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

export type ClassRoomTeacherOption = {
  displayName: string;
  teacherId: number;
};

type ClassRoomFormProps = {
  form: ClassRoomWriteInput;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (value: ClassRoomWriteInput) => void;
  onSubmit: (value: ClassRoomWriteInput) => void | Promise<void>;
  submitError: string | null;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomForm({
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitError,
  teacherOptions,
}: ClassRoomFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function update(
    field: keyof ClassRoomWriteInput,
    value: string | number | null
  ) {
    setValidationError(null);
    onChange({ ...form, [field]: value });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: ClassRoomWriteInput = {
      classCode: form.classCode.trim(),
      className: form.className.trim(),
      teacherId: form.teacherId,
    };
    if (!input.classCode || !input.className) {
      setValidationError("クラスコードとクラス名を入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit(input);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-text-base text-sm font-medium">
          クラスコード <span className="text-tone-danger-text">*</span>
          <input
            aria-label="クラスコード*"
            className={inputClassName}
            disabled={isSubmitting}
            maxLength={50}
            onChange={(event) => update("classCode", event.currentTarget.value)}
            value={form.classCode}
          />
        </label>
        <label className="text-text-base text-sm font-medium">
          クラス名 <span className="text-tone-danger-text">*</span>
          <input
            aria-label="クラス名*"
            className={inputClassName}
            disabled={isSubmitting}
            maxLength={100}
            onChange={(event) => update("className", event.currentTarget.value)}
            value={form.className}
          />
        </label>
      </div>
      <label className="text-text-base block text-sm font-medium">
        担当教官
        <select
          aria-label="担当教官"
          className={inputClassName}
          disabled={isSubmitting}
          onChange={(event) => {
            const value = event.currentTarget.value;
            update("teacherId", value ? Number(value) : null);
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
      {validationError || submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {validationError ?? submitError}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          キャンセル
        </Button>
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-9 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-50";
