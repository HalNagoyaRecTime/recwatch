import { Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";

type CompetitionCreatedStepProps = {
  competitionName: string;
  onClose: () => void;
};

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
          」を登録しました。集合場所や時間はイベント詳細から設定できます。
        </p>
      </div>
      <Button onClick={onClose} size="lg" variant="primary">
        一覧へ戻る
      </Button>
    </div>
  );
}
