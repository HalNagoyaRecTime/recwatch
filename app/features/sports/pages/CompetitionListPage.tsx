import { Pencil, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { apiClient } from "~/lib/api-client";

type Event = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
};

type Gathering = {
  gathering_id: number;
  gathering_group_id: number;
  event_id: number;
  gathering_spot_id: number;
  gathering_spot_name?: string;
  gathering_time: string;
};

type EventPage = {
  events: Event[];
  total: number;
};

function formatTime(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value || "未設定";
}

export function CompetitionListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const [eventPage, gatheringList] = await Promise.all([
          apiClient.get<EventPage>("/api/v1/events?limit=100&offset=0"),
          apiClient.get<Gathering[]>("/api/v1/gatherings"),
        ]);

        if (!isCurrent) return;

        setEvents(eventPage.events);
        setGatherings(gatheringList);
        if (eventPage.events.length > 0) {
          setSelectedId(eventPage.events[0].event_id);
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "初期データを取得できませんでした。"
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
  }, []);

  const competitions = useMemo(() => {
    return events.map((event) => {
      const eventGatherings = gatherings.filter(
        (g) => g.event_id === event.event_id
      );

      const uniqueTimes = Array.from(
        new Set(
          eventGatherings
            .map((g) => g.gathering_time)
            .filter((t) => t && t !== "99:59")
        )
      );
      const meetingTime =
        uniqueTimes.length > 0
          ? uniqueTimes.map(formatTime).join(", ")
          : "未設定";

      const uniquePlaces = Array.from(
        new Set(
          eventGatherings
            .map((g) => g.gathering_spot_name)
            .filter((p): p is string => Boolean(p))
        )
      );
      const meetingPlace =
        uniquePlaces.length > 0 ? uniquePlaces.join(", ") : "未設定";

      return {
        id: event.event_id,
        code: String(event.event_id).padStart(3, "0"),
        name: event.event_name,
        venue: event.venue,
        meetingTime,
        startTime: formatTime(event.start_time),
        endTime: formatTime(event.end_time),
        meetingPlace,
        rules: event.rule_text ?? "ルール未設定",
      };
    });
  }, [events, gatherings]);

  const filteredCompetitions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return competitions;
    }
    return competitions.filter((comp) =>
      `${comp.name} ${comp.venue} ${comp.meetingPlace}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [competitions, query]);

  const selected =
    competitions.find((comp) => comp.id === selectedId) ?? competitions[0];

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">競技管理</h1>
      <p className="mt-1 text-xs text-black/40">
        競技情報の登録・編集・確認ができます
      </p>

      {loadError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          初期データの取得に失敗しました: {loadError}
        </p>
      ) : null}

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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-black/40">
                      読み込み中...
                    </td>
                  </tr>
                ) : filteredCompetitions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-black/40">
                      競技が見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredCompetitions.map((competition) => (
                    <tr
                      key={competition.id}
                      onClick={() => setSelectedId(competition.id)}
                      className={`cursor-pointer border-b border-[#d2d2d2] last:border-b-0 ${selectedId === competition.id ? "bg-[#eff6ff]" : "hover:bg-[#f9fafb]"}`}
                    >
                      <td className="px-2 py-3 whitespace-nowrap">
                        {competition.code}
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
                          to={`/sports/${competition.id}/edit`}
                          aria-label={`${competition.name}を編集`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Pencil className="size-4 text-black/45" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <aside className="h-fit rounded-[14px] border border-[#d2d2d2] bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <strong>競技詳細</strong>
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
              to={`/sports/${selected.id}/edit`}
              className="mt-4 block rounded-[10px] border border-[#d2d2d2] px-4 py-2 text-center"
            >
              編集する
            </Link>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
