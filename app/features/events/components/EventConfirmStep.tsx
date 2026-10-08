import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { ArrowLeft, Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import type { EventFormValue } from "~/features/events/model/event-form";
import {
  formatVenueNames,
  type EventVenue,
} from "~/features/events/model/event-venue";

type EventConfirmStepProps = {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitError: string | null;
  value: EventFormValue;
  venueOptions: readonly EventVenue[];
};

export function EventConfirmStep({
  isSubmitting,
  onBack,
  onSubmit,
  submitError,
  value,
  venueOptions,
}: EventConfirmStepProps) {
  const selectedVenues = venueOptions.filter((venue) =>
    value.venueIds.includes(venue.id)
  );

  return (
    <div className="space-y-6">
      <dl className="border-border-base app-rounded divide-border-subtle divide-y border">
        <ConfirmRow label="イベント名" value={value.name} />
        <ConfirmRow label="実施場所" value={formatVenueNames(selectedVenues)} />
        <ConfirmRow label="開始時間" value={value.startTime} />
        <ConfirmRow label="終了時間" value={value.endTime} />
        <ConfirmRow label="ルール・備考" value={value.rules} markdown />
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

function ConfirmRow({
  label,
  value,
  markdown = false,
}: {
  label: string;
  value: string;
  markdown?: boolean;
}) {
  return (
    <div className="flex gap-6 px-5 py-4">
      <dt className="text-text-muted w-32 shrink-0 text-base">{label}</dt>
      <dd className="text-text-base min-w-0 flex-1 text-base font-medium break-words whitespace-pre-wrap">
        {markdown && value.trim() ? (
          <MarkdownContent content={value} />
        ) : (
          value.trim() || "—"
        )}
      </dd>
    </div>
  );
}
