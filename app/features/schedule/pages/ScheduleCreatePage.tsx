import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const scheduleTypes = ["開会式", "競技", "集合", "昼休み", "閉会式"] as const;

export function ScheduleCreatePage() {
  const [type, setType] = useState<(typeof scheduleTypes)[number]>("競技");
  const [notify, setNotify] = useState(true);

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">スケジュール 新規登録</h1>
      <p className="mt-1 text-xs text-black/40">
        登録内容はアプリのスケジュール表示に反映されます
      </p>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[440px_minmax(560px,1fr)]">
        <div className="space-y-4">
          <fieldset>
            <legend className="text-sm font-bold">
              種別 <span className="text-red-500">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {scheduleTypes.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    type === value
                      ? "border-[#0070bb] bg-[#0070bb]/10 font-bold text-[#0070bb]"
                      : "border-[#d2d2d2] bg-white text-black/50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold">
              開催時間 <span className="text-red-500">*</span>
            </legend>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="time"
                defaultValue="09:10"
                className="h-[38px] min-w-0 flex-1 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm"
              />
              <span className="text-sm text-black/50">〜</span>
              <input
                type="time"
                defaultValue="10:10"
                className="h-[38px] min-w-0 flex-1 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm"
              />
            </div>
          </fieldset>

          <label className="block text-sm font-bold">
            実施場所
            <select
              defaultValue=""
              className="mt-1 h-[38px] w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal text-black/50"
            >
              <option value="" disabled>
                例：コートA
              </option>
              <option>コートA</option>
              <option>コートB</option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            集合場所
            <select
              defaultValue=""
              className="mt-1 h-[38px] w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal text-black/50"
            >
              <option value="" disabled>
                例：集合場所A（任意）
              </option>
              <option>集合場所A</option>
              <option>集合場所B</option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            関連競技
            <select
              defaultValue=""
              className="mt-1 h-[38px] w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal text-black/50"
            >
              <option value="" disabled>
                例：走れ！〇人〇脚！
              </option>
              <option>走れ！〇人〇脚！</option>
              <option>ガチンコ綱引き</option>
            </select>
          </label>

          <label className="block text-sm font-bold">
            備考
            <textarea
              placeholder="補足事項を入力（任意）"
              className="mt-1 h-[68px] w-full resize-none rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2 font-normal"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-bold">投稿方法</legend>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setNotify(true)}
                className={`flex items-center gap-2 rounded-[10px] border px-4 py-2 text-sm ${
                  notify
                    ? "border-[#0070bb] bg-[#0070bb] text-white"
                    : "border-[#d2d2d2] bg-white"
                }`}
              >
                <Bell className="size-4" />
                通知あり
              </button>
              <button
                type="button"
                onClick={() => setNotify(false)}
                className={`rounded-[10px] border px-4 py-2 text-sm ${
                  !notify
                    ? "border-[#0070bb] bg-[#0070bb] text-white"
                    : "border-[#d2d2d2] bg-white"
                }`}
              >
                通知なし
              </button>
            </div>
            <p className="mt-2 text-xs text-black/40">
              「通知あり」で投稿すると、参加メンバーにプッシュ通知が送信されます
            </p>
          </fieldset>

          <div className="flex gap-3 pt-1">
            <Link
              to="/schedule"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-5 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-5 py-2 text-sm text-white"
            >
              <Check className="size-4" />
              登録する
            </button>
          </div>
        </div>

        <aside className="min-w-0">
          <p className="text-xs text-black/40">一覧表示プレビュー</p>
          <div className="mt-2 overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
            <table className="w-full min-w-[760px] text-left text-xs">
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
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#d2d2d2] px-3 py-2"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="h-11">
                  <td colSpan={8} aria-label="登録前のため表示内容なし" />
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-xs text-black/40">
            配信先イメージ（スマートフォン通知）
          </p>
          <div className="mt-2 flex justify-center rounded-[14px] border border-[#d2d2d2] bg-white p-5">
            <div className="w-[270px] rounded-[32px] border-[7px] border-[#252525] bg-[#eef2f7] p-3 shadow-sm">
              <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-[#252525]" />
              <div className="rounded-[14px] bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-[8px] bg-[#0070bb] text-white">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">REC TIME</p>
                    <p className="text-[10px] text-black/40">たった今</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-bold">スケジュールのお知らせ</p>
                <p className="mt-1 text-[11px] leading-5 text-black/60">
                  新しいスケジュールが登録されました。
                </p>
              </div>
              <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-black/30" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
