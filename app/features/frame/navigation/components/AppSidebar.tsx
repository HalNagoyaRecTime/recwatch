import { useLocation } from "react-router";
import { currentUser } from "~/config/permissions";
import { cn } from "~/lib/cn";
import { useNavigationUI } from "~/features/frame/navigation/hooks/useNavigationUI";
import { getVisibleNavSections } from "~/features/frame/navigation/model/nav-config";
import type { NavSectionDef } from "~/types/nav";
import { SidebarNavItem } from "./SidebarNavItem";

export function AppSidebar() {
  const sections = getVisibleNavSections(currentUser.role);
  const { isExpanded } = useNavigationUI();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-visible">
      <div
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain py-3 transition-[padding] duration-200",
          isExpanded ? "px-3.5" : "px-2"
        )}
      >
        {sections.map((section, sIdx) => (
          <NavSection
            key={section.label ?? `section-${sIdx}`}
            section={section}
            pathname={pathname}
            isExpanded={isExpanded}
          />
        ))}
      </div>
    </aside>
  );
}

// --- Local Components ---

type NavSectionProps = {
  section: NavSectionDef;
  pathname: string;
  isExpanded: boolean;
};

function NavSection({ section, pathname, isExpanded }: NavSectionProps) {
  const hasLabel = Boolean(section.label);
  const shouldShowLine = section.hasDivider || (!isExpanded && hasLabel);

  return (
    <section
      className={cn(
        "transition-[margin] duration-200 first:mt-0",
        shouldShowLine ? "mt-3" : "mt-[18px]"
      )}
    >
      {/* 線とラベルの表示を「セクションの導入部」として丸投げ */}
      <NavSectionSeparator
        section={section}
        isExpanded={isExpanded}
        shouldShowLine={shouldShowLine}
        hasLabel={hasLabel}
      />

      {/* 中身のアイテムたちの描画 */}
      <div>
        {section.items.map((item) => (
          <SidebarNavItem key={item.id} item={item} pathname={pathname} />
        ))}
      </div>
    </section>
  );
}

function NavSectionSeparator({
  section,
  isExpanded,
  shouldShowLine,
  hasLabel,
}: {
  section: NavSectionDef;
  isExpanded: boolean;
  shouldShowLine: boolean;
  hasLabel: boolean;
}) {
  // 線もラベルもない場合は何も描画しない
  if (!hasLabel && !section.hasDivider) return null;

  return (
    <div className="flex flex-col justify-center">
      {/* 
        横棒（フル幅の線を流用）
        isExpandedの変化に合わせて滑らかに fade-in / fade-out する
      */}
      <div
        className={cn(
          "mx-2 bg-(--border-1) transition-all duration-200",
          shouldShowLine ? "mb-3 h-px opacity-100" : "mb-0 h-0 opacity-0"
        )}
      />

      {/* 
        ラベル
        isExpandedの変化に合わせて滑らかに高さ（max-height）と透明度が変わる
      */}
      {hasLabel && (
        <div
          className={cn(
            "overflow-hidden px-2.5 font-bold tracking-[0.12em] whitespace-nowrap text-(--text-3) uppercase transition-all duration-200",
            isExpanded
              ? "max-h-10 pb-2 text-[10px] opacity-100"
              : "max-h-0 pb-0 text-[10px] opacity-0"
          )}
        >
          {section.label}
        </div>
      )}
    </div>
  );
}
