import { Link } from "react-router";

type View = "list" | "monitor" | "calendar";
const destinations = [
  { value: "list", label: "一覧", to: "/notifications" },
  { value: "monitor", label: "配信モニター", to: "/notifications/monitor" },
  {
    value: "calendar",
    label: "カレンダー",
    to: "/notifications?view=calendar",
  },
] as const;

export function NotificationManagementNavigation({ active }: { active: View }) {
  return (
    <nav
      aria-label="通知管理"
      className="border-border-base flex gap-1 border-b"
    >
      {destinations.map(({ value, label, to }) => (
        <Link
          key={value}
          to={to}
          aria-current={active === value ? "page" : undefined}
          className={`border-b-2 px-3 py-2 text-sm transition-colors ${active === value ? "border-brand-primary text-text-base font-semibold" : "text-text-muted hover:text-text-base border-transparent"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
