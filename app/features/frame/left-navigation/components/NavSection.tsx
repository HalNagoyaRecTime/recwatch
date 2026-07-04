import { NavItem } from "~/features/frame/left-navigation/components/NavItem";
import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";
import { cn } from "~/lib/cn";
import type { NavSectionDef } from "~/types/nav";

type NavSectionProps = {
  def: NavSectionDef;
};

export function NavSection({ def }: NavSectionProps) {
  const isExpanded = useLeftNavigationExpanded();

  return (
    <section
      className={cn(
        "mt-[18px] first:mt-0",
        def.hasDivider && "border-border-1 mt-3 border-t pt-3"
      )}
    >
      {def.label && (
        <div
          className={cn(
            "text-text-3 overflow-hidden px-2.5 pb-2 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap uppercase transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0"
          )}
        >
          {def.label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {def.items.map((item) => (
          <NavItem key={item.id} def={item} />
        ))}
      </div>
    </section>
  );
}
