import { currentUser } from "~/config/permissions";

import { getVisibleNavSections } from "~/features/layout/left-navigation/model/nav-config";
import { NavSection } from "~/features/layout/left-navigation/components/NavSection";

export function AppSidebar() {
  const sections = getVisibleNavSections(currentUser.role);

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-visible">
      <div className="flex-1 overflow-x-visible overflow-y-auto overscroll-y-contain px-2 py-3">
        {sections.map((section, index) => (
          <NavSection key={section.label ?? `section-${index}`} def={section} />
        ))}
      </div>
    </aside>
  );
}
