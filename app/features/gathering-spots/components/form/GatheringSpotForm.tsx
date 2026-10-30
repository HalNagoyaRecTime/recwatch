import { Check } from "lucide-react";
import { useState } from "react";

import { PlaceImageField } from "~/components/management/PlaceImageField";
import { Button } from "~/components/ui/button/Button";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";
import type { PlaceImageChange } from "~/types/place-image-change";

type GatheringSpotFormProps = {
  autoFocusImage: boolean;
  editingSpot: GatheringSpot | null;
  imageChange: PlaceImageChange | null;
  isSubmitting: boolean;
  name: string;
  submitError: string | null;
  onChange: (name: string) => void;
  onClose: () => void;
  onImageChange: (change: PlaceImageChange | null) => void;
  onSubmit: () => void | Promise<void>;
};

export function GatheringSpotForm({
  autoFocusImage,
  editingSpot,
  imageChange,
  isSubmitting,
  name,
  submitError,
  onChange,
  onClose,
  onImageChange,
  onSubmit,
}: GatheringSpotFormProps) {
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  return (
    <form
      aria-labelledby="gathering-spot-form-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isImageProcessing) return;
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

        <PlaceImageField
          autoFocus={autoFocusImage}
          change={imageChange}
          currentImageUrl={editingSpot?.imageUrl ?? null}
          disabled={isSubmitting}
          isProcessing={isImageProcessing}
          label="集合場所の画像"
          onChange={onImageChange}
          onProcessingChange={setIsImageProcessing}
        />

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

        <div className="grid grid-cols-2 gap-3">
          <Button disabled={isSubmitting} onClick={onClose} size="md">
            キャンセル
          </Button>
          <Button
            disabled={isSubmitting || isImageProcessing}
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
