import { Check } from "lucide-react";

type CompetitionCreatedStepProps = {
  competitionName: string;
  onClose: () => void;
  onConfigureGatherings: () => void;
};

export function CompetitionCreatedStep({
  competitionName,
  onClose,
  onConfigureGatherings,
}: CompetitionCreatedStepProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span className="bg-tone-success-bg text-tone-success-text inline-flex size-16 items-center justify-center rounded-full">
        <Check aria-hidden="true" className="size-8" />
      </span>
      <div className="space-y-2">
        <p className="text-text-base text-xl font-semibold">
          イベントを作成しました
        </p>
        <p className="text-text-muted text-base">
          「{competitionName}
          」を登録しました。続けて集合設定を行うか、あとから設定できます。
        </p>
      </div>
      <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
        <ChoiceButton
          description="イベント一覧へ戻ります。"
          label="あとで設定する"
          onClick={onClose}
        />
        <ChoiceButton
          description="Roundごとの集合設定へ進みます。"
          label="集合を設定する"
          onClick={onConfigureGatherings}
        />
      </div>
    </div>
  );
}

function ChoiceButton({
  description,
  label,
  onClick,
}: {
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="border-border-base hover:border-border-strong hover:bg-surface-hover app-rounded flex flex-col items-start gap-1 border px-4 py-3 text-left transition-colors"
      onClick={onClick}
      type="button"
    >
      <span className="text-text-base text-base font-semibold">{label}</span>
      <span className="text-text-muted text-sm">{description}</span>
    </button>
  );
}
