import { Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import type { Venue } from "~/features/venues/model/venue";

type VenueFormProps = {
  editingVenue: Venue | null;
  isSubmitting: boolean;
  name: string;
  submitError: string | null;
  onChange: (name: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

export function VenueForm({
  editingVenue,
  isSubmitting,
  name,
  submitError,
  onChange,
  onClose,
  onSubmit,
}: VenueFormProps) {
  return (
    <form
      aria-labelledby="venue-form-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="space-y-5">
        <h2
          id="venue-form-title"
          className="text-text-base text-lg font-semibold"
        >
          {editingVenue ? "実施場所の編集" : "新規実施場所の追加"}
        </h2>

        <label className="block">
          <span className="text-text-base mb-2 block text-sm font-medium">
            実施場所名 <span className="text-tone-danger-text">*</span>
          </span>
          <input
            aria-describedby={submitError ? "venue-name-error" : undefined}
            aria-invalid={Boolean(submitError)}
            aria-label="実施場所名*"
            className={inputClassName}
            disabled={isSubmitting}
            id="venue-name"
            maxLength={100}
            onChange={(event) => onChange(event.currentTarget.value)}
            placeholder="例：体育館、グラウンド"
            required
            value={name}
          />
        </label>

        {submitError ? (
          <p
            id="venue-name-error"
            aria-live="polite"
            className="text-tone-danger-text text-sm"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={isSubmitting} onClick={onClose} size="md">
            キャンセル
          </Button>
          <Button
            disabled={isSubmitting}
            icon={Check}
            size="md"
            type="submit"
            variant="primary"
          >
            {isSubmitting ? "保存中..." : "保存する"}
          </Button>
        </div>
      </div>
    </form>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base placeholder:text-text-subtle focus:border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors disabled:opacity-50";
