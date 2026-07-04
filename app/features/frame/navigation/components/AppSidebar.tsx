import { NavLink, useLocation } from "react-router";
import { ChevronRightIcon } from "lucide-react";

import { currentUser } from "~/config/permissions";
import { cn } from "~/lib/cn";
import { useNavState } from "~/hooks/useNavState";
import { useNavigationExpanded } from "~/features/frame/navigation/hooks/useNavigationExpanded";
import { getVisibleNavSections } from "~/features/frame/navigation/model/nav-config";
import { actionListItemStyle } from "~/components/ui/styles/action-list-styles";
import type { NavItemDef } from "~/types/nav";

function pathMatches(pathname: string, to: string) {
  if (to === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function closeOnSmallScreen(closeForMobile: () => void) {
  if (typeof window !== "undefined" && window.innerWidth <= 720) {
    closeForMobile();
  }
}

function SidebarNavItem({
  item,
  pathname,
}: {
  item: NavItemDef;
  pathname: string;
}) {
  const isExpanded = useNavigationExpanded();
  const { openAccordions, toggleAccordion, closeForMobile } = useNavState();

  const hasChildren = Boolean(item.children?.length);
  const isAccordionOpen = openAccordions.includes(item.id);
  const isActive = hasChildren
    ? (item.children?.some((child) => pathMatches(pathname, child.to)) ?? false)
    : item.to
      ? pathMatches(pathname, item.to)
      : false;

  const triggerContent = (
    <>
      <span className="inline-flex w-4 min-w-4 items-center justify-center">
        {item.icon}
      </span>
      <span
        className={cn(
          "overflow-hidden text-[13px] font-medium whitespace-nowrap transition-[max-width,opacity] duration-200",
          isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
        )}
      >
        {item.label}
      </span>
      {hasChildren && (
        <ChevronRightIcon
          size={14}
          strokeWidth={1.8}
          className={cn(
            "ml-auto text-(--text-3) transition duration-200",
            isExpanded ? "opacity-100" : "hidden",
            isAccordionOpen ? "rotate-90" : ""
          )}
        />
      )}
    </>
  );

  const triggerClass = ({ isActive: active }: { isActive: boolean }) =>
    cn(
      actionListItemStyle({ intent: "nav", active }),
      "transition-all duration-200 w-full",
      !isExpanded && "gap-0 pr-0 pl-3",
      hasChildren && isActive && "hover:bg-transparent"
    );

  const hoverPopup = (
    <div
      className={cn(
        "pointer-events-none absolute top-0 left-[66px] z-100 min-w-[180px] translate-x-[-4px] opacity-0 shadow-(--shadow-soft) transition duration-150",
        "group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100",
        isExpanded && "hidden"
      )}
    >
      <div className="rounded-lg border border-(--border-2) bg-(--surface-overlay-strong) p-1">
        {hasChildren && item.children ? (
          <>
            <div className="flex items-center gap-2.5 px-2.5 pt-1 pb-2 text-[12.5px] font-semibold text-(--text-1)">
              <span className="inline-flex w-4 min-w-4 items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            <div className="mx-1 my-1 h-px bg-(--border-1)" />
            <div className="flex flex-col">
              {item.children.map((child) => (
                <NavLink
                  key={child.id}
                  to={child.to}
                  className={({ isActive: childActive }) =>
                    actionListItemStyle({ intent: "nav", active: childActive })
                  }
                  onClick={() => closeOnSmallScreen(closeForMobile)}
                >
                  <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
                    {child.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </>
        ) : (
          <div className="px-[11px] py-[5px] text-[12.5px] font-medium text-(--text-1)">
            {item.label}
          </div>
        )}
      </div>
    </div>
  );

  if (hasChildren && item.children) {
    return (
      <div className="group/nav relative">
        <button
          type="button"
          className={triggerClass({ isActive: false })}
          onClick={() => {
            if (isExpanded) toggleAccordion(item.id);
          }}
        >
          {triggerContent}
        </button>

        {hoverPopup}

        <div
          className="ml-[17.5px] overflow-hidden border-l border-(--border-1) pl-[7.5px] transition-[max-height] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: isExpanded && isAccordionOpen ? 400 : 0 }}
        >
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.to}
              className={({ isActive: childActive }) =>
                actionListItemStyle({ intent: "nav", active: childActive })
              }
              onClick={() => closeOnSmallScreen(closeForMobile)}
            >
              <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
                {child.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  if (!item.to) return null;

  return (
    <div className="group/nav relative">
      <NavLink
        to={item.to}
        className={triggerClass}
        onClick={() => closeOnSmallScreen(closeForMobile)}
      >
        {triggerContent}
      </NavLink>

      {hoverPopup}
    </div>
  );
}

export function AppSidebar() {
  const sections = getVisibleNavSections(currentUser.role);
  const isExpanded = useNavigationExpanded();
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
          <section
            key={section.label ?? `section-${sIdx}`}
            className={cn(
              "mt-[18px] first:mt-0",
              section.hasDivider && "mt-3 border-t border-(--border-1) pt-3"
            )}
          >
            {section.label && (
              <div className="overflow-hidden px-2.5 pb-2 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-(--text-3) uppercase transition-all duration-200">
                {isExpanded ? (
                  section.label
                ) : (
                  <div className="flex h-3.5 w-full items-center justify-center">
                    <div className="h-[1px] w-6 bg-(--border-strong)" />
                  </div>
                )}
              </div>
            )}
            <div>
              {section.items.map((item) => (
                <SidebarNavItem key={item.id} item={item} pathname={pathname} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
