import { useState } from "react";
import { Link } from "react-router";

export function NotificationCreatePage() {
  const [title, setTitle] = useState("競技開始時間の変更");
  const [body, setBody] = useState(
    "走れ！〇人〇脚！の開始時間が 09:00 から 09:10 に変更になりました。"
  );
  const [target, setTarget] = useState("全体");

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">通知作成</h1>
      <p className="mt-1 text-xs text-black/40">
        生徒や関係者に配信するプッシュ通知を作成します
      </p>

      <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(360px,512px)_minmax(420px,576px)]">
        <div className="space-y-4">
          <label className="block text-sm font-bold">
            タイトル <span className="text-red-500">*</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="タイトルを入力"
              className="mt-1 block h-[38px] w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none focus:border-[#0070bb]"
            />
          </label>
          <label className="block text-sm font-bold">
            本文 <span className="text-red-500">*</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="本文を入力"
              className="mt-1 block h-24 w-full resize-none rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2 font-normal outline-none focus:border-[#0070bb]"
            />
          </label>
          <label className="block text-sm font-bold">
            通知対象 <span className="text-red-500">*</span>
            <select
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="mt-1 block h-[38px] w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal"
            >
              <option>全体</option>
              <option>クラスA</option>
              <option>競技参加者</option>
            </select>
          </label>
          <p className="text-xs text-black/40">全体 / クラス / 競技参加者</p>
          <div className="flex gap-3">
            <Link
              to="/notifications"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              className="rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white"
            >
              配信する
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white text-sm">
            {[
              ["タイトル", title || "—"],
              ["本文", body || "—"],
              ["通知対象", target],
              ["配信時間", "09:00"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[96px_1fr] gap-6 border-b border-[#d2d2d2] px-5 py-4 last:border-b-0"
              >
                <span className="text-xs text-black/40">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-black/50">
              配信先イメージ（スマートフォン通知）
            </p>
            <div className="relative h-[398px] w-[187px] overflow-hidden rounded-[24px] border border-[#bbb] bg-white p-4 shadow-md">
              <div className="flex justify-between text-[10px] font-bold">
                <span>9:00</span>
                <span>● ◒ ▰</span>
              </div>
              <div className="mt-10 text-center">
                <div className="text-[32px] font-thin">9:00</div>
                <div className="text-[9px]">2025年11月07日 金曜日</div>
              </div>
              <div className="mt-14 rounded-[10px] bg-[#d1d1d1]/90 p-2 text-[6px]">
                <div className="font-bold">recwatch</div>
                <div className="mt-1 font-bold">{title || "通知タイトル"}</div>
                <div className="mt-1 line-clamp-2">{body || "通知本文"}</div>
              </div>
              <div className="absolute right-0 bottom-7 left-0 text-center text-[9px] text-[#aaa]">
                上にスワイプして開く
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
