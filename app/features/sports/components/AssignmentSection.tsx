import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

type AssignmentSectionProps = {
  aside?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
  title: string;
};

export function AssignmentSection({
  aside,
  children,
  footer,
  icon: Icon,
  title,
}: AssignmentSectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="border-border-subtle border-b pb-7 last:border-b-0 last:pb-0"
    >
      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon aria-hidden="true" className="text-brand-primary size-5" />
          <h2 className="text-text-base text-lg font-semibold" id={headingId}>
            {title}
          </h2>
        </div>
        {aside}
      </div>
      <div>{children}</div>
      {footer ? (
        <div className="border-border-subtle mt-5 border-t pt-4">{footer}</div>
      ) : null}
    </section>
  );
}
