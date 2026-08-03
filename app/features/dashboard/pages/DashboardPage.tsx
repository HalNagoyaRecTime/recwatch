import { Link } from "react-router";

const pageGroups = [
  {
    label: "基本・認証",
    pages: [
      ["ログイン", "/login"],
      ["ダッシュボード", "/dashboard"],
      ["設定", "/settings"],
    ],
  },
  {
    label: "通知",
    pages: [
      ["通知管理", "/notifications"],
      ["通知作成", "/notifications/new"],
    ],
  },
  {
    label: "ユーザー管理",
    pages: [
      ["学生一覧", "/members"],
      ["読み込み確認", "/members/import"],
      ["クラス管理", "/classroom"],
      ["教官管理", "/instructors"],
    ],
  },
  {
    label: "競技管理",
    pages: [
      ["競技一覧", "/events"],
      ["競技登録", "/events/new"],
      ["競技編集", "/events/2/edit"],
      ["競技割り当て", "/events/assignments"],
      ["集合場所管理", "/gathering-spots"],
    ],
  },
  {
    label: "スケジュール",
    pages: [
      ["スケジュール管理", "/schedule"],
      ["スケジュール登録", "/schedule/new"],
      ["出場メンバー管理", "/participants"],
    ],
  },
] as const;

export function DashboardPage({
  connectionError,
}: {
  connectionError?: string;
}) {
  return (
    <div className="min-h-full rounded-[14px] bg-[#f7faff] p-6 text-[#0a0a0a]">
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-8">
        <h1 className="text-center text-[clamp(40px,6vw,64px)] font-bold">
          ようこそ
        </h1>
        <div className="w-full max-w-6xl">
          <p className="mb-3 text-center text-sm text-black/50">
            現在登録されている画面へのリンク
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {pageGroups.map((group) => (
              <section
                key={group.label}
                className="rounded-[14px] border border-[#d2d2d2] bg-white p-4 shadow-sm"
              >
                <h2 className="mb-3 text-sm font-bold text-black/60">
                  {group.label}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {group.pages.map(([label, to]) => (
                    <Link
                      key={to}
                      to={to}
                      className="rounded-[10px] border border-[#d2d2d2] bg-[#f9fbff] px-3 py-2.5 text-center text-sm font-bold transition hover:border-[#0070bb] hover:bg-[#eff6ff] hover:text-[#0070bb]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        {connectionError ? (
          <p className="w-full max-w-5xl rounded-[10px] border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-sm text-[#b45309]">
            接続確認: {connectionError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
