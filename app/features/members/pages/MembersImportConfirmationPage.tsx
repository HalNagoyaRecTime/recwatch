import { Check } from "lucide-react";
import { Link } from "react-router";

const importedStudents = [
  ["0001", "IA00B001", "01", "近藤 良助", "クラスA"],
  ["0002", "IA00B002", "02", "山口 穂香", "クラスB"],
  ["0003", "IA00B003", "03", "佐々木 瑞樹", "クラスC"],
  ["0004", "IA00B004", "04", "田中 花音", "クラスD"],
  ["0005", "IA00B005", "05", "鈴木 大輝", "クラスE"],
  ["0006", "IA00B006", "06", "伊藤 咲良", "クラスA"],
  ["0007", "IA00B007", "07", "渡辺 陽太", "クラスB"],
  ["0008", "IA00B008", "08", "高橋 美玲", "クラスC"],
  ["0009", "IA00B009", "09", "小林 蓮", "クラスD"],
  ["0010", "IA00B010", "10", "加藤 結衣", "クラスE"],
] as const;

export function MembersImportConfirmationPage() {
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">取り込み確認</h1>
      <p className="mt-1 text-xs text-black/40">
        以下の内容を登録します。問題なければ「登録する」を押してください。
      </p>
      <div className="mt-4 flex h-16 w-40 flex-col items-center justify-center rounded-[14px] border border-[#d2d2d2] bg-white">
        <span className="text-xs text-black/40">取り込み件数</span>
        <strong className="mt-1 text-xl">2,000件</strong>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span>
          ファイル：<strong>students_2025_fixed.csv</strong>
        </span>
        <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-xs text-[#1447e6]">
          データ種別：学生
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
        <div className="max-h-[330px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[#f9fafb] text-[11px] text-black/50">
              <tr>
                {["通し番号", "学籍番号", "出席番号", "氏名", "クラス"].map(
                  (h) => (
                    <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {importedStudents.map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-[#d2d2d2] even:bg-[#fafbfd]"
                >
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d2d2d2] px-4 py-3 text-xs text-black/50">
          <span>2,000件中 1〜25件を表示</span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled
              className="rounded border px-2 py-1 opacity-30"
            >
              ‹
            </button>
            {[1, 2, 3, 4].map((n) => (
              <button
                type="button"
                key={n}
                className={`rounded border px-2 py-1 ${n === 1 ? "border-[#0070bb] bg-[#0070bb] text-white" : "bg-white"}`}
              >
                {n}
              </button>
            ))}
            <span className="px-2 py-1">…</span>
            <button type="button" className="rounded border bg-white px-2 py-1">
              40
            </button>
            <button type="button" className="rounded border bg-white px-2 py-1">
              ›
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Link
          to="/members"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
        >
          戻る
        </Link>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white"
        >
          <Check className="size-4" />
          登録する（2,000件）
        </button>
      </div>
    </div>
  );
}
