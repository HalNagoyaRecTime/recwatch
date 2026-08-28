import { Loader2, Upload } from "lucide-react";
import { type ChangeEvent, type ReactNode, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  buttonIconStyle,
  buttonStyle,
} from "~/components/ui/button/styles/button-styles";
import { masterImportApi, type MasterImportType } from "../api";

interface ImportUploadTriggerProps {
  adjacentAction?: ReactNode;
  type: MasterImportType;
  helperText?: string;
}

export function ImportUploadTrigger({
  adjacentAction,
  type,
  helperText = "取り込み前にプレビューで内容を確認できます",
}: ImportUploadTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const session = await masterImportApi.create(type, file);
      navigate(
        `/members/import?importId=${encodeURIComponent(session.importId)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ファイルの取り込みに失敗しました。"
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className={buttonStyle({
            layout: "content",
            size: "md",
            variant: "secondary",
          })}
        >
          {isUploading ? (
            <Loader2
              aria-hidden="true"
              className={`${buttonIconStyle({ variant: "secondary" })} animate-spin`}
            />
          ) : (
            <Upload
              aria-hidden="true"
              className={buttonIconStyle({ variant: "secondary" })}
            />
          )}
          <span className="truncate">CSV / Excel を取り込む</span>
        </button>
        {adjacentAction}
        <span className="text-text-subtle text-xs">{helperText}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {error && <p className="text-tone-danger-text text-xs">{error}</p>}
    </div>
  );
}
