import { Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

const competitions = [
  {
    id: "001",
    name: "走れ！〇人〇脚！",
    venue: "コートA",
    meetingTime: "08:55",
    startTime: "09:10",
    endTime: "10:30",
    meetingPlace: "集合場所A",
    rules: "1. グループ分け\n　- 各グループは最大4名まで。",
  },
  {
    id: "002",
    name: "ガチンコ綱引き",
    venue: "コートB",
    meetingTime: "10:15",
    startTime: "10:30",
    endTime: "11:40",
    meetingPlace: "集合場所B",
    rules: "1. チーム分け\n　- クラスごとにチームを編成します。",
  },
  {
    id: "003",
    name: "四天王ドッチボール",
    venue: "コートA",
    meetingTime: "11:25",
    startTime: "11:40",
    endTime: "12:50",
    meetingPlace: "集合場所C",
    rules: "1. チーム対抗\n　- 制限時間内の得点で競います。",
  },
  {
    id: "004",
    name: "紙飛行機飛ばし",
    venue: "コートC",
    meetingTime: "13:15",
    startTime: "13:30",
    endTime: "14:40",
    meetingPlace: "集合場所A",
    rules: "1. 飛距離計測\n　- 最長飛距離を記録します。",
  },
  {
    id: "005",
    name: "学科別対抗リレー",
    venue: "コートB",
    meetingTime: "14:05",
    startTime: "14:20",
    endTime: "15:50",
    meetingPlace: "集合場所B",
    rules: "1. 学科対抗\n　- 学科ごとの合計タイムで競います。",
  },
] as const;

export function CompetitionListPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(competitions[0].id);
  const filteredCompetitions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return competitions;
    }
    return competitions.filter((competition) =>
      `${competition.name} ${competition.venue}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query]);
  const selected =
    competitions.find((competition) => competition.id === selectedId) ??
    competitions[0];

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">競技管理</h1>
      <p className="mt-1 text-xs text-black/40">
        競技情報の登録・編集・確認ができます
      </p>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(700px,1fr)_240px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <label className="flex h-[38px] w-[220px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
              <Search className="size-4 text-black/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 outline-none"
                placeholder="競技名・場所で検索"
              />
            </label>
            <Link
              to="/sports/new"
              className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
            >
              <Plus className="size-4" />
              新規登録
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
            <table className="w-full table-fixed border-collapse text-left text-[11px]">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[22%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[17%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                <tr>
                  {[
                    "競技ID",
                    "競技名",
                    "実施場所",
                    "集合時間",
                    "開始時間",
                    "終了時間",
                    "集合場所",
                    "操作",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#d2d2d2] px-2 py-2 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCompetitions.map((competition) => (
                  <tr
                    key={competition.id}
                    onClick={() => setSelectedId(competition.id)}
                    className={`cursor-pointer border-b border-[#d2d2d2] last:border-b-0 ${selectedId === competition.id ? "bg-[#eff6ff]" : "hover:bg-[#f9fafb]"}`}
                  >
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.id}
                    </td>
                    <td className="px-2 py-3 text-xs font-bold whitespace-nowrap">
                      {competition.name}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.venue}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.meetingTime}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.startTime}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.endTime}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {competition.meetingPlace}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        to={`/sports/${Number(competition.id)}/edit`}
                        aria-label={`${competition.name}を編集`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Pencil className="size-4 text-black/45" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="h-fit rounded-[14px] border border-[#d2d2d2] bg-white p-4 text-sm">
          <div className="flex items-center justify-between">
            <strong>競技詳細</strong>
            <button type="button" aria-label="詳細を閉じる">
              <X className="size-4 text-black/45" />
            </button>
          </div>
          <dl className="mt-3 space-y-3">
            {[
              ["競技名", selected.name],
              ["競技ルール", selected.rules],
              ["実施場所", selected.venue],
              ["集合場所", selected.meetingPlace],
              ["開始時間", selected.startTime],
              ["終了時間", selected.endTime],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-[10px] text-black/40">{term}</dt>
                <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            to={`/sports/${Number(selected.id)}/edit`}
            className="mt-4 block rounded-[10px] border border-[#d2d2d2] px-4 py-2 text-center"
          >
            編集する
          </Link>
        </aside>
      </div>
    </div>
  );
}
