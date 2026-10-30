import { Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { cn } from "~/lib/cn";
import { resizeImage } from "~/lib/resize-image";
import type { PlaceImageChange } from "~/types/place-image-change";

type PlaceImageFieldProps = {
  autoFocus?: boolean;
  change: PlaceImageChange | null;
  currentImageUrl: string | null;
  disabled?: boolean;
  label: string;
  onChange: (change: PlaceImageChange | null) => void;
  onProcessingChange: (isProcessing: boolean) => void;
};

export function PlaceImageField({
  autoFocus = false,
  change,
  currentImageUrl,
  disabled = false,
  label,
  onChange,
  onProcessingChange,
}: PlaceImageFieldProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDisabled = disabled || isProcessing;
  const [error, setError] = useState<string | null>(null);
  const hasImage =
    change?.type === "replace" ||
    (change?.type !== "remove" && currentImageUrl !== null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsProcessing(true);
    onProcessingChange(true);
    setError(null);
    try {
      onChange({ type: "replace", image: await resizeImage(file) });
    } catch {
      setError(
        "画像を読み込めませんでした。JPEG・PNG・WebP の画像を選択してください。"
      );
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  }

  function handleRemove() {
    setError(null);
    onChange(currentImageUrl ? { type: "remove" } : null);
  }

  return (
    <div className="space-y-2">
      <span className="text-text-base block text-sm font-medium">画像</span>
      <label
        className={cn(
          "border-border-base bg-surface-muted has-[:focus-visible]:outline-brand-primary relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
          isDisabled
            ? "opacity-50"
            : "hover:border-border-strong cursor-pointer"
        )}
      >
        {isProcessing ? (
          <span className="text-text-subtle text-sm">読み込み中...</span>
        ) : change?.type === "replace" ? (
          <BlobImage alt={label} blob={change.image} />
        ) : hasImage && currentImageUrl ? (
          <img alt={label} className={imageClassName} src={currentImageUrl} />
        ) : (
          <span className="text-text-subtle text-sm">画像を選択</span>
        )}
        <input
          accept="image/*"
          aria-label={`${label}を選択`}
          autoFocus={autoFocus}
          className="sr-only"
          disabled={isDisabled}
          onChange={(event) => void handleFileChange(event)}
          type="file"
        />
      </label>
      {hasImage ? (
        <Button
          disabled={isDisabled}
          icon={Trash2}
          onClick={handleRemove}
          size="sm"
          variant="ghost"
        >
          画像を削除
        </Button>
      ) : null}
      {hasImage ? (
        <p className="text-text-subtle text-xs">画像を押すと変更できます</p>
      ) : null}
      {error ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// object URL を state や useMemo に持つと、作成と revoke の時期がずれて revoke 済みの URL が残りうるため、effect 内で作って src に直接入れる
function BlobImage({ alt, blob }: { alt: string; blob: Blob }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return <img alt={alt} className={imageClassName} ref={ref} />;
}

const imageClassName = "size-full object-cover";
