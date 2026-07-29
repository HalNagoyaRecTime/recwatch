import { AlertCircle, ChevronUp, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const assignments = [
  [
    "クラスA",
    "走れ！〇人〇脚！",
    "山田 花子、鈴木 一郎、佐藤 次郎、田中 三郎、青木 五郎、木村 六子",
  ],
  ["クラスB", "ガチンコ綱引き", "3年A組 全員"],
  ["クラスA", "走れ！〇人〇脚！", "加藤 四郎、伊藤 五郎、渡辺 六子"],
  ["クラスC", "四天王ドッチボール", "—"],
  ["クラスB", "学科別対抗リレー", "長谷川 一、長谷川 二、長谷川 一（重複）"],
] as const;

export function ParticipantsPage() {
  const [tab, setTab] = useState<"class" | "sport">("class");
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold">出場メンバー管理</h1>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("class")}
              className={`rounded-[10px] border px-4 py-2 text-sm font-bold ${tab === "class" ? "border-[#0070bb] bg-[#0070bb] text-white" : "border-[#d2d2d2] bg-white"}`}
            >
              クラス別
            </button>
            <button
              type="button"
              onClick={() => setTab("sport")}
              className={`rounded-[10px] border px-4 py-2 text-sm font-bold ${tab === "sport" ? "border-[#0070bb] bg-[#0070bb] text-white" : "border-[#d2d2d2] bg-white"}`}
            >
              競技別
            </button>
          </div>
        </div>
        <Link
          to="/events/assignments"
          className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
        >
          <Plus className="size-4" />
          競技を割り当てる
        </Link>
      </div>
      <div className="mt-5 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {(tab === "class"
                ? ["クラス", "競技", "割り当てメンバー", "操作"]
                : ["競技", "クラス", "割り当てメンバー", "操作"]
              ).map((h) => (
                <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((row, index) => (
              <tr
                key={`${row[0]}-${row[1]}-${index}`}
                className={`border-b border-[#d2d2d2] last:border-b-0 ${index === 4 ? "bg-[#fff7ed]" : ""}`}
              >
                <td className="px-4 py-3 font-bold">
                  {tab === "class" ? row[0] : row[1]}
                </td>
                <td className="px-4 py-3">
                  {tab === "class" ? row[1] : row[0]}
                </td>
                <td className="px-4 py-3 text-xs text-black/70">{row[2]}</td>
                <td className="px-4 py-3">
                  <button type="button" aria-label="編集">
                    <Pencil className="size-4 text-black/45" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 overflow-hidden rounded-[10px] border border-[#ffc9c9] bg-white">
        <div className="flex items-center gap-2 bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#c10007]">
          <AlertCircle className="size-4" />
          2件の注意があります — 確認してください
          <ChevronUp className="ml-auto size-4" />
        </div>
        <div className="border-t border-[#ffe2e2] px-4 py-3 text-xs text-[#c10007]">
          <strong className="mr-2 text-[#ff6467]">[重複]</strong>クラスB
          学科別対抗リレー — 同一メンバーが重複登録されています
        </div>
        <div className="border-t border-[#ffe2e2] px-4 py-3 text-xs text-[#c10007]">
          <strong className="mr-2 text-[#ff6467]">[時間重複]</strong>山田 花子 —
          走れ！〇人〇脚！（09:10〜10:10）とガチンコ綱引き（10:30〜11:30）の出場時間が重複しています
        </div>
      </div>
    </div>
  );
}
