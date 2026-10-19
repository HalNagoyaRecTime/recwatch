import { Link } from "react-router";

type UserManagementSection = "classrooms" | "students" | "teachers";

type UserManagementTabsProps = {
  active: UserManagementSection;
};

const tabs: ReadonlyArray<{
  id: UserManagementSection;
  label: string;
  to: string;
}> = [
  { id: "students", label: "学生管理", to: "/members" },
  { id: "classrooms", label: "クラス管理", to: "/classroom" },
  { id: "teachers", label: "教官管理", to: "/teachers" },
];

export function UserManagementTabs({ active }: UserManagementTabsProps) {
  return (
    <nav aria-label="ユーザー" className="flex flex-wrap gap-2">
      {tabs.map((tab) =>
        tab.id === active ? (
          <span
            aria-current="page"
            className="app-rounded bg-brand-primary text-text-base-inverse px-4 py-2 text-sm font-medium"
            key={tab.id}
          >
            {tab.label}
          </span>
        ) : (
          <Link
            className="app-rounded border-border-base bg-surface-base text-text-muted hover:border-border-strong hover:bg-surface-hover hover:text-text-base border px-4 py-2 text-sm font-medium transition-colors"
            key={tab.id}
            to={tab.to}
          >
            {tab.label}
          </Link>
        )
      )}
    </nav>
  );
}
