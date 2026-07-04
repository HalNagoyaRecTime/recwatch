import { cn } from "~/lib/cn";

type Metric = {
  label: string;
  value: string;
  meta: string;
};

type Activity = {
  name: string;
  meta: string;
  tone: "green" | "blue" | "orange" | "red";
  status: string;
};

type AdminScreenPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Metric[];
  activityTitle: string;
  activityHint: string;
  activities: Activity[];
  panelTitle: string;
  panelHint: string;
  checklist: Activity[];
};

export function AdminScreenPage({
  eyebrow,
  title,
  description,
  metrics,
  activityTitle,
  activityHint,
  activities,
  panelTitle,
  panelHint,
  checklist,
}: AdminScreenPageProps) {
  const toneClassName: Record<Activity["tone"], string> = {
    green:
      "border-[color:var(--tone-green-border)] bg-[color:var(--tone-green-bg)] text-[color:var(--tone-green-text)]",
    blue: "border-[color:var(--tone-blue-border)] bg-[color:var(--tone-blue-bg)] text-[color:var(--tone-blue-text)]",
    orange:
      "border-[color:var(--tone-cyan-border)] bg-[color:var(--tone-cyan-bg)] text-[color:var(--tone-cyan-text)]",
    red: "border-[color:var(--tone-red-border)] bg-[color:var(--tone-red-bg)] text-[color:var(--tone-red-text)]",
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <section className="grid gap-[18px] xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-6 shadow-[var(--shadow-soft)]">
          <div className="font-['DM_Mono'] text-xs tracking-[0.12em] text-[color:var(--brand-2)] uppercase">
            {eyebrow}
          </div>
          <h1 className="mt-2.5 text-[clamp(28px,4vw,40px)] leading-[1.04] font-semibold">
            {title}
          </h1>
          <p className="mt-3 max-w-[50ch] text-sm leading-7 text-[color:var(--text-2)]">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">{panelTitle}</div>
            <div className="text-xs text-[color:var(--text-3)]">
              {panelHint}
            </div>
          </div>
          {checklist.map((item) => (
            <div
              key={`${item.name}-${item.status}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] px-[14px] py-3"
            >
              <div>
                <div className="text-[13px] font-medium">{item.name}</div>
                <div className="text-xs text-[color:var(--text-3)]">
                  {item.meta}
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-2 py-1 font-['DM_Mono'] text-[10px] tracking-[0.04em] uppercase",
                  toneClassName[item.tone]
                )}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-[18px] shadow-[var(--shadow-soft)]"
          >
            <div className="font-['DM_Mono'] text-[11px] tracking-[0.08em] text-[color:var(--text-3)] uppercase">
              {metric.label}
            </div>
            <div className="mt-2.5 text-[30px] leading-none font-semibold">
              {metric.value}
            </div>
            <div className="mt-2 text-xs text-[color:var(--text-2)]">
              {metric.meta}
            </div>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{activityTitle}</div>
          <div className="text-xs text-[color:var(--text-3)]">
            {activityHint}
          </div>
        </div>
        {activities.map((activity) => (
          <div
            key={`${activity.name}-${activity.meta}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] px-[14px] py-3"
          >
            <div>
              <div className="text-[13px] font-medium">{activity.name}</div>
              <div className="text-xs text-[color:var(--text-3)]">
                {activity.meta}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-2 py-1 font-['DM_Mono'] text-[10px] tracking-[0.04em] uppercase",
                toneClassName[activity.tone]
              )}
            >
              {activity.status}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
