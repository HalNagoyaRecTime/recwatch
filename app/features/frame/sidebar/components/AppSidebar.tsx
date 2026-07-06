import { useLocation } from "react-router";
import { currentUser } from "~/config/permissions";
import { cn } from "~/lib/cn";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { buildSidebarMenu } from "~/features/frame/sidebar/utils/build-sidebar-menu";
import type { SidebarSectionDef } from "~/types/sidebar";
import { SidebarNavItem } from "~/features/frame/sidebar/components/SidebarNavItem";
import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

export function AppSidebar() {
  const sections = buildSidebarMenu(currentUser.role);
  const { isExpanded } = useSidebarUI();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-visible">
      <div
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain py-3",
          "transition-all",
          SIDEBAR_DURATION,
          isExpanded ? "px-3.5" : "px-2"
        )}
      >
        {sections.map((section, sIdx) => (
          <SidebarSection
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

type SidebarSectionProps = {
  section: SidebarSectionDef;
  pathname: string;
  isExpanded: boolean;
};

// セクション
function SidebarSection({
  section,
  pathname,
  isExpanded,
}: SidebarSectionProps) {
  const hasLabel = Boolean(section.label);
  const shouldShowLine = section.hasDivider || (!isExpanded && hasLabel);

  return (
    <section
      className={cn(
        "first:mt-0",
        "transition-all",
        SIDEBAR_DURATION,
        shouldShowLine ? "mt-3" : "mt-4.5"
      )}
    >
      {/* 線とラベルの表示を「セクションの導入部」として丸投げ */}
      <SidebarSectionSeparator
        section={section}
        isExpanded={isExpanded}
        shouldShowLine={shouldShowLine}
        hasLabel={hasLabel}
      />

      {/* 中身のアイテムたちの描画 */}
      {section.items.map((item) => (
        <SidebarNavItem key={item.id} item={item} pathname={pathname} />
      ))}
    </section>
  );
}

function SidebarSectionSeparator({
  section,
  isExpanded,
  shouldShowLine,
  hasLabel,
}: {
  section: SidebarSectionDef;
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
          "bg-border-1 mx-2",
          "transition-all",
          SIDEBAR_DURATION,
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
            "text-text-3 overflow-hidden px-2.5 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap uppercase",
            "transition-all",
            SIDEBAR_DURATION,
            isExpanded ? "max-h-10 pb-2 opacity-100" : "max-h-0 pb-0 opacity-0"
          )}
        >
          {section.label}
        </div>
      )}
    </div>
  );
}
