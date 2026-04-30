import type { NavSectionDef } from "~/types/nav";
import { cn } from "~/lib/cn";

import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";
import { NavItem } from "~/features/frame/left-navigation/components/NavItem";

type NavSectionProps = {
  def: NavSectionDef;
};

export function NavSection({ def }: NavSectionProps) {
  const isExpanded = useLeftNavigationExpanded();

  return (
    <section className="mt-[18px] first:mt-0">
      <div
        className={cn(
          "overflow-hidden px-2.5 pb-2 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-[color:var(--text-3)] uppercase transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      >
        {def.label}
      </div>
      <div>
        {def.items.map((item) => (
          <NavItem key={item.id} def={item} />
        ))}
      </div>
    </section>
  );
}
