import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

export type DashboardNavigationItem = {
  label: string;
  to: string;
};

type DashboardNavigationCardProps = {
  icon: LucideIcon;
  id: string;
  items: DashboardNavigationItem[];
  title: string;
};

export function DashboardNavigationCard({
  icon: Icon,
  id,
  items,
  title,
}: DashboardNavigationCardProps) {
  const headingId = `dashboard-navigation-${id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="app-rounded border-border-base bg-surface-base shadow-soft flex h-full min-w-0 flex-col overflow-hidden border"
    >
      <header className="border-border-base bg-surface-muted flex items-center gap-3 border-b px-6 py-4">
        <Icon
          aria-hidden="true"
          className="text-brand-primary"
          size={21}
          strokeWidth={1.8}
        />
        <h3 id={headingId} className="text-text-base text-base font-semibold">
          {title}
        </h3>
      </header>
      <nav aria-label={title} className="flex-1 px-4">
        <ul className="divide-border-base divide-y">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                aria-label={item.label}
                to={item.to}
                className="group -mx-2 flex min-h-18 items-center gap-3 px-3 py-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-text-base group-hover:text-brand-primary block text-base font-semibold transition-colors">
                    {item.label}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="text-text-subtle group-hover:text-brand-primary shrink-0 transition-colors"
                  size={18}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
