import { ArrowRight, Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";

type CompetitionCreatedStepProps = {
  competitionName: string;
  onClose: () => void;
};

/** イベント本体の作成完了を示し、集合設定を行うイベント詳細へ送る。 */
export function CompetitionCreatedStep({
  competitionName,
  onClose,
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
          」を登録しました。イベント詳細から集合設定を行えます。
        </p>
      </div>
      <Button
        icon={ArrowRight}
        onClick={onClose}
        size="lg"
        type="button"
        variant="primary"
      >
        イベント詳細へ進む
      </Button>
    </div>
  );
}
