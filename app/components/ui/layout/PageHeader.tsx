import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  description?: string;
  title: string;
};

export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-text-base text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-text-muted mt-1 text-sm">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
