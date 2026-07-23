import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function CompetitionEditPage() {
  const [form, setForm] = useState({
    name: "走れ！〇人〇脚！",
    rules: "1. グループ分け\n- 各グループは最大4名まで。",
    venue: "コートA",
    meeting: "08:55",
    start: "09:10",
    end: "10:30",
    meetingPlace: "集合場所A",
  });
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">競技 編集</h1>
      <p className="mt-1 text-xs text-black/40">
        アプリの競技一覧・競技詳細に反映されます
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[440px_minmax(320px,384px)]">
        <div className="space-y-3">
          <label className="block text-sm font-bold">
            競技名 <span className="text-red-500">*</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none"
            />
          </label>
          <label className="block text-sm font-bold">
            競技ルール <span className="text-red-500">*</span>
            <textarea
              value={form.rules}
              onChange={(e) => update("rules", e.target.value)}
              className="mt-1 h-16 w-full resize-none rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2 font-normal outline-none"
            />
          </label>
          {[
            ["venue", "実施場所"],
            ["meeting", "集合時間"],
            ["start", "開始時間"],
            ["end", "終了時間"],
            ["meetingPlace", "集合場所"],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-bold">
              {label} <span className="text-red-500">*</span>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  update(key as keyof typeof form, e.target.value)
                }
                className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none"
              />
            </label>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              to="/sports"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[10px] bg-[#fe9a00] px-5 py-2 text-sm text-white"
            >
              <Check className="size-4" />
              変更を保存する
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
              ["集合時間", form.meeting],
              ["開始時間", form.start],
              ["終了時間", form.end],
              ["集合場所", form.meetingPlace],
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
