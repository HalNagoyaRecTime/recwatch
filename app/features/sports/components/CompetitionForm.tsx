import { Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { CompetitionFormValue } from "~/features/sports/model/competition-form";

type CompetitionFormProps = {
  isDisabled: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (value: CompetitionFormValue) => void;
  onSubmit: () => void;
  submitError: string | null;
  submitLabel: string;
  title: string;
  value: CompetitionFormValue;
};

export function CompetitionForm({
  isDisabled,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitError,
  submitLabel,
  title,
  value,
}: CompetitionFormProps) {
  function update(field: keyof CompetitionFormValue, nextValue: string) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <div className="min-h-full space-y-6">
      <PageHeader
        description="登録内容はイベント登録一覧へ反映されます"
        title={title}
      />

      <form
        className="max-w-2xl space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className={labelClassName}>
          イベント名 <span className="text-tone-danger-text">*</span>
          <input
            aria-label="イベント名*"
            className={inputClassName}
            disabled={isDisabled}
            maxLength={100}
            onChange={(event) => update("name", event.currentTarget.value)}
            placeholder="例：大縄跳び"
            value={value.name}
          />
        </label>
        <label className={labelClassName}>
          イベントルール
          <textarea
            aria-label="イベントルール"
            className={`${inputClassName} min-h-24 resize-y py-2`}
            disabled={isDisabled}
            maxLength={1000}
            onChange={(event) => update("rules", event.currentTarget.value)}
            placeholder="ルールの詳細を入力"
            value={value.rules}
          />
        </label>
        <label className={labelClassName}>
          実施場所 <span className="text-tone-danger-text">*</span>
          <input
            aria-label="実施場所*"
            className={inputClassName}
            disabled={isDisabled}
            maxLength={100}
            onChange={(event) => update("venue", event.currentTarget.value)}
            placeholder="例：運動場"
            value={value.venue}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClassName}>
            開始時間 <span className="text-tone-danger-text">*</span>
            <input
              aria-label="開始時間*"
              className={inputClassName}
              disabled={isDisabled}
              onChange={(event) =>
                update("startTime", event.currentTarget.value)
              }
              type="time"
              value={value.startTime}
            />
          </label>
          <label className={labelClassName}>
            終了時間 <span className="text-tone-danger-text">*</span>
            <input
              aria-label="終了時間*"
              className={inputClassName}
              disabled={isDisabled}
              onChange={(event) => update("endTime", event.currentTarget.value)}
              type="time"
              value={value.endTime}
            />
          </label>
        </div>

        {submitError ? (
          <p className="text-tone-danger-text text-sm" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onCancel} type="button" variant="secondary">
            キャンセル
          </Button>
          <Button
            disabled={isDisabled}
            icon={Check}
            type="submit"
            variant="primary"
          >
            {isSubmitting ? "保存中..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

const labelClassName = "text-text-base block text-sm font-medium";
const inputClassName =
  "app-rounded border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-10 w-full border px-3 text-sm outline-none disabled:opacity-50";
