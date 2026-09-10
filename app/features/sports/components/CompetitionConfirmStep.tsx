import { ArrowLeft, Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import type { CompetitionFormValue } from "~/features/sports/model/competition-form";

type CompetitionConfirmStepProps = {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitError: string | null;
  value: CompetitionFormValue;
};

export function CompetitionConfirmStep({
  isSubmitting,
  onBack,
  onSubmit,
  submitError,
  value,
}: CompetitionConfirmStepProps) {
  return (
    <div className="space-y-6">
      <dl className="border-border-base app-rounded divide-border-subtle divide-y border">
        <ConfirmRow label="イベント名" value={value.name} />
        <ConfirmRow label="実施場所" value={value.venue} />
        <ConfirmRow label="開始時間" value={value.startTime} />
        <ConfirmRow label="終了時間" value={value.endTime} />
        <ConfirmRow label="ルール・備考" value={value.rules} />
      </dl>

      {submitError ? (
        <p className="text-tone-danger-text text-base" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <Button
          disabled={isSubmitting}
          icon={ArrowLeft}
          onClick={onBack}
          size="lg"
          variant="secondary"
        >
          戻る
        </Button>
        <Button
          disabled={isSubmitting}
          icon={Check}
          onClick={onSubmit}
          size="lg"
          variant="primary"
        >
          {isSubmitting ? "作成中..." : "イベントを作成"}
        </Button>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6 px-5 py-4">
      <dt className="text-text-muted w-32 shrink-0 text-base">{label}</dt>
      <dd className="text-text-base min-w-0 flex-1 text-base font-medium break-words whitespace-pre-wrap">
        {value.trim() || "—"}
      </dd>
    </div>
  );
}
