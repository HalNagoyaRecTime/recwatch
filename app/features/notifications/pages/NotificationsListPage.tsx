import { Check, CircleAlert, Trash2, X } from "lucide-react";
import { Link } from "react-router";

const notifications = [
  {
    title: "競技開始時間の変更",
    body: "走れ！〇人〇脚！の開始時間が変更になりました。",
    target: "全体",
    sentAt: "11/07 09:05",
    author: "HAL 太郎",
    sport: "走れ！〇人〇脚！",
    schedule: "09:10~10:10",
    status: "配信済",
  },
  {
    title: "集合場所のお知らせ",
    body: "ガチンコ綱引きの集合場所は集合場所Bです。",
    target: "全体",
    sentAt: "11/07 10:10",
    author: "HAL 太郎",
    sport: "ガチンコ綱引き",
    schedule: "10:15~10:25",
    status: "配信済",
  },
  {
    title: "緊急連絡",
    body: "昼休み終了時刻を13:20に変更します。",
    target: "全体",
    sentAt: "11/07 12:50",
    author: "HAL 太郎",
    sport: "—",
    schedule: "昼休み",
    status: "配信済",
  },
  {
    title: "紙飛行機飛ばし",
    body: "紙飛行機飛ばしの集合場所は集合場所Cです。",
    target: "競技参加者",
    sentAt: "11/07 13:20",
    author: "HAL 太郎",
    sport: "紙飛行機飛ばし",
    schedule: "13:30~14:10",
    status: "送信失敗",
  },
] as const;

export function NotificationsListPage() {
  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-bold">通知管理</h1>
          <p className="mt-1 text-xs text-black/40">
            配信済み通知の一覧と配信状態を確認できます
          </p>
        </div>
        <Link
          to="/notifications/new"
          className="rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
        >
          ＋ 通知作成
        </Link>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-[10px] border border-[#fcd34d] bg-[#fffbeb] p-3 text-xs text-[#b45309]">
        <CircleAlert className="mt-px size-4 shrink-0" />
        配信件数・成功件数の詳細は FCM（Firebase Cloud
        Messaging）の管理画面で確認してください。
      </div>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
        <table className="w-full table-fixed border-collapse text-left text-[11px]">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead className="bg-[#f9fafb] text-[11px] text-black/50">
            <tr>
              {[
                "件名 / 本文",
                "配信対象",
                "配信日時",
                "作成・配信者",
                "関連競技",
                "関連スケジュール",
                "状態",
                "操作",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#d2d2d2] px-2 py-2 font-bold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifications.map((item) => (
              <tr
                key={item.title}
                className="border-b border-[#d2d2d2] last:border-b-0"
              >
                <td className="px-2 py-3">
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="mt-1 text-black/50">{item.body}</div>
                </td>
                <td className="px-2 py-3">{item.target}</td>
                <td className="px-2 py-3">{item.sentAt}</td>
                <td className="px-2 py-3">{item.author}</td>
                <td className="px-2 py-3">{item.sport}</td>
                <td className="px-2 py-3">{item.schedule}</td>
                <td className="px-2 py-3">
                  <span
                    className={`flex items-center gap-1 ${item.status === "配信済" ? "text-[#00a63e]" : "text-[#d1101d]"}`}
                  >
                    {item.status === "配信済" ? (
                      <Check className="size-3" />
                    ) : (
                      <X className="size-3" />
                    )}
                    {item.status}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <button type="button" aria-label={`${item.title}を削除`}>
                    <Trash2 className="size-4 text-black/45" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
