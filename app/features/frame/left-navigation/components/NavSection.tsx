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
    <section
      className={cn(
        "mt-[18px] first:mt-0",
        def.hasDivider && "mt-3 border-t border-[color:var(--border-1)] pt-3"
      )}
    >
      {def.label && (
        <div
          className={cn(
            "overflow-hidden px-2.5 pb-2 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-[color:var(--text-3)] uppercase transition-all duration-200"
          )}
        >
          {isExpanded ? (
            def.label
          ) : (
            <div className="flex h-3.5 w-full items-center justify-center">
              <div className="h-[1px] w-6 bg-[color:var(--border-strong)]" />
            </div>
          )}
        </div>
      )}
      <div>
        {def.items.map((item) => (
          <NavItem key={item.id} def={item} />
        ))}
      </div>
    </section>
  );
}
