import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";

const schedule = [
  ["開会式", "08:30~09:00", "コートA", "—", "—", "—", "即時公開"],
  ["競技", "09:10~10:10", "コートB", "—", "走れ！〇人〇脚！", "—", "即時公開"],
  [
    "集合",
    "10:15~10:25",
    "—",
    "集合場所A",
    "—",
    "ガチンコ綱引き前の集合",
    "09:50",
  ],
  ["競技", "10:30~11:30", "コートA", "—", "ガチンコ綱引き", "—", "即時公開"],
  [
    "競技",
    "11:40~12:20",
    "コートA",
    "—",
    "四天王ドッチボール",
    "—",
    "即時公開",
  ],
  ["昼休み", "12:20~13:20", "各自", "—", "—", "—", "即時公開"],
  ["競技", "13:30~14:10", "コートB", "—", "紙飛行機飛ばし", "—", "13:00"],
  ["競技", "14:20~15:30", "コートC", "—", "学科別対抗リレー", "—", "即時公開"],
  ["閉会式", "15:45~17:00", "コートA", "—", "—", "—", "即時公開"],
] as const;

const badgeStyles: Record<string, string> = {
  開会式: "bg-[#eff6ff] text-[#1447e6]",
  閉会式: "bg-[#eff6ff] text-[#1447e6]",
  競技: "bg-[#fefce8] text-[#a65f00]",
  集合: "bg-[#fff7ed] text-[#f56b12]",
  昼休み: "bg-[#f0fdf4] text-[#008236]",
};

export function ScheduleListPage() {
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold">スケジュール管理</h1>
          <p className="mt-1 text-xs text-black/40">
            当日のスケジュール・競技予定・集合予定を管理します
          </p>
        </div>
        <Link
          to="/schedule/new"
          className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
        >
          <Plus className="size-4" />
          新規登録
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {[
                "種別",
                "開催時間",
                "開催場所",
                "集合場所",
                "関連競技",
                "備考",
                "予約投稿",
                "操作",
              ].map((h) => (
                <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr
                key={`${row[0]}-${row[1]}`}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${badgeStyles[row[0]]}`}
                  >
                    {row[0]}
                  </span>
                </td>
                {row.slice(1, 6).map((cell, cellIndex) => (
                  <td
                    key={`${cell}-${cellIndex}`}
                    className={
                      cell === "—" ? "px-4 py-3 text-black/35" : "px-4 py-3"
                    }
                  >
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3">
                  {row[6] === "即時公開" ? (
                    <span className="text-xs text-black/40">即時公開</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Clock3 className="size-3" />
                      {row[6]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 text-black/45">
                    <button type="button" aria-label={`${index + 1}件目を編集`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" aria-label={`${index + 1}件目を削除`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
