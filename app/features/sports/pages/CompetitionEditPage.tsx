import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { apiClient } from "~/lib/api-client";

type Event = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
};

function formatTimeForDisplay(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

function formatTimeForSubmit(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  let formatted = "";
  if (parts.length === 2) {
    formatted = parts[0].padStart(2, "0") + parts[1].padStart(2, "0");
  } else {
    formatted = trimmed.replace(":", "").padStart(4, "0");
  }
  return /^([01]\d|2[0-3])[0-5]\d$/.test(formatted) ? formatted : null;
}

export function CompetitionEditPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    rules: "",
    venue: "",
    start: "",
    end: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      if (!competitionId) {
        setLoadError("競技IDが不正です。");
        setIsLoading(false);
        return;
      }

      try {
        const event = await apiClient.get<Event>(
          `/api/v1/events/${competitionId}`
        );
        if (!isCurrent) return;

        setForm({
          name: event.event_name,
          rules: event.rule_text ?? "",
          venue: event.venue,
          start: formatTimeForDisplay(event.start_time),
          end: formatTimeForDisplay(event.end_time),
        });
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "競技データの取得に失敗しました。"
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, [competitionId]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit() {
    if (!competitionId) return;

    if (!form.name.trim() || !form.venue.trim()) {
      setSubmitError("競技名および実施場所を入力してください。");
      return;
    }

    const startTime = formatTimeForSubmit(form.start);
    const endTime = formatTimeForSubmit(form.end);

    if (!startTime || !endTime) {
      setSubmitError(
        "開始時間および終了時間を正しい形式（例 09:10）で入力してください。"
      );
      return;
    }

    if (startTime >= endTime) {
      setSubmitError("終了時間は開始時間より後の時刻を指定してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.put(`/api/v1/events/${competitionId}`, {
        event_name: form.name.trim(),
        rule_text: form.rules.trim() || null,
        venue: form.venue.trim(),
        start_time: startTime,
        end_time: endTime,
      });

      navigate("/sports");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "競技データの更新に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">競技 編集</h1>
      <p className="mt-1 text-xs text-black/40">
        アプリの競技一覧・競技詳細に反映されます
      </p>

      {loadError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[440px_minmax(320px,384px)]">
        <div className="space-y-3">
          <label className="block text-sm font-bold">
            競技名 <span className="text-red-500">*</span>
            <input
              disabled={isLoading || isSubmitting}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-bold">
            競技ルール <span className="text-red-500">*</span>
            <textarea
              disabled={isLoading || isSubmitting}
              value={form.rules}
              onChange={(e) => update("rules", e.target.value)}
              className="mt-1 h-16 w-full resize-none rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2 font-normal outline-none disabled:opacity-50"
            />
          </label>

          <label className="block text-sm font-bold">
            実施場所 <span className="text-red-500">*</span>
            <input
              disabled={isLoading || isSubmitting}
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
              className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
            />
          </label>

          <label className="block text-sm font-bold">
            開始時間 <span className="text-red-500">*</span>
            <input
              disabled={isLoading || isSubmitting}
              value={form.start}
              onChange={(e) => update("start", e.target.value)}
              placeholder="09:10"
              className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
            />
          </label>

          <label className="block text-sm font-bold">
            終了時間 <span className="text-red-500">*</span>
            <input
              disabled={isLoading || isSubmitting}
              value={form.end}
              onChange={(e) => update("end", e.target.value)}
              placeholder="10:30"
              className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
            />
          </label>

          {submitError ? (
            <p className="text-sm text-red-600">{submitError}</p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Link
              to="/sports"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              disabled={isLoading || isSubmitting}
              onClick={() => void handleSubmit()}
              className="flex items-center gap-2 rounded-[10px] bg-[#fe9a00] px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" />
              {isSubmitting ? "保存中..." : "変更を保存する"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs text-black/40">アプリ表示プレビュー</p>
          <div className="overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            {[
              ["競技名", form.name],
              ["競技ルール", form.rules],
              ["実施場所", form.venue],
              ["開始時間", form.start],
              ["終了時間", form.end],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[80px_1fr] gap-4 border-b border-[#d2d2d2] px-5 py-3 last:border-b-0"
              >
                <span className="text-xs text-black/40">{label}</span>
                <span className="text-sm whitespace-pre-wrap">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
