import { Check } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type GatheringSpotFormProps = {
  editingSpot: GatheringSpot | null;
  isSubmitting: boolean;
  name: string;
  submitError: string | null;
  onChange: (name: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

export function GatheringSpotForm({
  editingSpot,
  isSubmitting,
  name,
  submitError,
  onChange,
  onClose,
  onSubmit,
}: GatheringSpotFormProps) {
  return (
    <form
      aria-labelledby="gathering-spot-form-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="space-y-5">
        <h2
          id="gathering-spot-form-title"
          className="text-text-base text-lg font-semibold"
        >
          {editingSpot ? "集合場所の編集" : "新規集合場所の追加"}
        </h2>

        <label className="block">
          <span className="text-text-base mb-2 block text-sm font-medium">
            集合場所名 <span className="text-tone-danger-text">*</span>
          </span>
          <input
            aria-describedby={
              submitError ? "gathering-spot-name-error" : undefined
            }
            aria-invalid={Boolean(submitError)}
            aria-label="集合場所名*"
            className={inputClassName}
            disabled={isSubmitting}
            id="gathering-spot-name"
            maxLength={100}
            onChange={(event) => onChange(event.currentTarget.value)}
            placeholder="例：体育館前、コートA"
            required
            value={name}
          />
        </label>

        {submitError ? (
          <p
            id="gathering-spot-name-error"
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
