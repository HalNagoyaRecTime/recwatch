import { currentUser } from "~/config/permissions";
import { cn } from "~/lib/cn";
import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";

import { getVisibleNavSections } from "~/features/frame/left-navigation/model/nav-config";
import { NavSection } from "~/features/frame/left-navigation/components/NavSection";

export function AppSidebar() {
  const sections = getVisibleNavSections(currentUser.role);
  const isExpanded = useLeftNavigationExpanded();

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-visible">
      <div
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain py-3 transition-[padding] duration-200",
          isExpanded ? "px-3.5" : "px-2"
        )}
      >
        {sections.map((section, index) => (
          <NavSection key={section.label ?? `section-${index}`} def={section} />
        ))}
      </div>
    </aside>
  );
}
