import { Loader2, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { masterImportApi, type MasterImportType } from "../api";

interface ImportUploadTriggerProps {
  type: MasterImportType;
  helperText?: string;
}

export function ImportUploadTrigger({
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
        `/members/import?importId=${encodeURIComponent(session.import_id)}`
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
          className="flex items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          CSV / Excel を取り込む
        </button>
        <span className="text-xs text-black/40">{helperText}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
