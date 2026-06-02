import { ChevronRightIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import { useNavState } from "~/hooks/useNavState";
import { cn } from "~/lib/cn";
import type { NavChildDef, NavItemDef } from "~/types/nav";

import { NavAccordion } from "~/features/frame/left-navigation/components/NavAccordion";
import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";

type NavItemProps = {
  def: NavItemDef;
};

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

function itemBaseClass(isActive: boolean) {
  return cn(
    "relative flex min-h-[42px] w-full items-center gap-3 rounded-xl bg-transparent px-3 text-[color:var(--text-2)] transition",
    "hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-1)]",
    isActive
      ? "bg-[color:var(--surface-brand-soft)] text-[color:var(--text-1)]"
      : ""
  );
}

function badgeClass() {
  return "ml-auto rounded-full border border-[color:var(--border-1)] px-[7px] py-[2px] font-['DM_Mono'] text-[10px] text-[color:var(--text-2)]";
}

function ChildLink({
  child,
  closeForMobile,
}: {
  child: NavChildDef;
  closeForMobile: () => void;
}) {
  return (
    <NavLink
      to={child.to}
      className={({ isActive }) => itemBaseClass(isActive)}
      onClick={() => closeOnSmallScreen(closeForMobile)}
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span className="absolute inset-y-[5px] left-0 w-[2.5px] rounded-r-sm bg-[color:var(--brand-1)]" />
          ) : null}
          <span className="inline-flex w-4 min-w-4 items-center justify-center" />
          <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
            {child.label}
          </span>
          {child.badge ? (
            <span className={badgeClass()}>{child.badge}</span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function NavItem({ def }: NavItemProps) {
  const pathname = useLocation().pathname;
  const isSidebarOpen = useNavState((state) => state.isOpen);
  const isExpanded = useLeftNavigationExpanded();
  const openAccordions = useNavState((state) => state.openAccordions);
  const toggleAccordion = useNavState((state) => state.toggleAccordion);
  const closeForMobile = useNavState((state) => state.closeForMobile);
  const hasChildren = Boolean(def.children?.length);
  const isAccordionOpen = openAccordions.includes(def.id);
  const isActive = hasChildren
    ? (def.children?.some((child) => pathMatches(pathname, child.to)) ?? false)
    : def.to
      ? pathMatches(pathname, def.to)
      : false;

  if (hasChildren && def.children) {
    return (
      <div className="group/nav relative">
        <button
          type="button"
          className={itemBaseClass(isActive)}
          onClick={() => {
            if (isSidebarOpen) {
              toggleAccordion(def.id);
            }
          }}
        >
          {isActive ? (
            <span className="absolute inset-y-[5px] left-0 w-[2.5px] rounded-r-sm bg-[color:var(--brand-1)]" />
          ) : null}
          <span className="inline-flex w-4 min-w-4 items-center justify-center">
            {def.icon}
          </span>
          <span
            className={cn(
              "overflow-hidden text-[13px] font-medium whitespace-nowrap transition-[max-width,opacity] duration-200",
              isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
            )}
          >
            {def.label}
          </span>
          {def.badge ? (
            <span
              className={cn(
                badgeClass(),
                isExpanded ? "opacity-100" : "hidden"
              )}
            >
              {def.badge}
            </span>
          ) : null}
          <ChevronRightIcon
            size={14}
            strokeWidth={1.8}
            className={cn(
              "ml-auto text-[color:var(--text-3)] transition duration-200",
              isExpanded ? "opacity-100" : "hidden",
              isAccordionOpen ? "rotate-90" : ""
            )}
          />
        </button>
        <NavAccordion isOpen={isExpanded && isAccordionOpen}>
          {def.children.map((child) => (
            <ChildLink
              key={child.id}
              child={child}
              closeForMobile={closeForMobile}
            />
          ))}
        </NavAccordion>
        {!isExpanded ? (
          <div className="pointer-events-none absolute top-0 left-[66px] z-[200] min-w-[180px] translate-x-[-4px] rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-1 opacity-0 shadow-[var(--shadow-soft)] transition duration-150 group-focus-within/nav:pointer-events-auto group-focus-within/nav:translate-x-0 group-focus-within/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100">
            <div className="flex items-center gap-2.5 border-b border-[color:var(--border-1)] px-2.5 pt-2 pb-2 text-[12.5px] font-semibold text-[color:var(--text-1)]">
              <span className="inline-flex w-4 min-w-4 items-center justify-center">
                {def.icon}
              </span>
              <span>{def.label}</span>
              {def.badge ? (
                <span className={badgeClass()}>{def.badge}</span>
              ) : null}
            </div>
            <div className="pt-1">
              {def.children.map((child) => {
                const childActive = pathMatches(pathname, child.to);

                return (
                  <NavLink
                    key={child.id}
                    to={child.to}
                    className={cn(
                      "flex min-h-[35px] items-center gap-2 rounded-lg px-2.5 text-[12.5px] transition",
                      childActive
                        ? "bg-[color:var(--surface-2)] text-[color:var(--text-1)]"
                        : "text-[color:var(--text-2)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-1)]"
                    )}
                    onClick={() => closeOnSmallScreen(closeForMobile)}
                  >
                    <span>{child.label}</span>
                    {child.badge ? (
                      <span className={badgeClass()}>{child.badge}</span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (!def.to) {
    return null;
  }

  return (
    <div className="group/nav relative">
      <NavLink
        to={def.to}
        className={({ isActive: linkActive }) => itemBaseClass(linkActive)}
        onClick={() => closeOnSmallScreen(closeForMobile)}
      >
        {({ isActive: linkActive }) => (
          <>
            {linkActive ? (
              <span className="absolute inset-y-[5px] left-0 w-[2.5px] rounded-r-sm bg-[color:var(--brand-1)]" />
            ) : null}
            <span className="inline-flex w-4 min-w-4 items-center justify-center">
              {def.icon}
            </span>
            <span
              className={cn(
                "overflow-hidden text-[13px] font-medium whitespace-nowrap transition-[max-width,opacity] duration-200",
                isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
              )}
            >
              {def.label}
            </span>
            {def.badge ? (
              <span
                className={cn(
                  badgeClass(),
                  isExpanded ? "opacity-100" : "hidden"
                )}
              >
                {def.badge}
              </span>
            ) : null}
          </>
        )}
      </NavLink>
      {!isExpanded ? (
        <div className="pointer-events-none absolute top-1/2 left-[66px] z-[200] translate-x-[-4px] -translate-y-1/2 rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-[11px] py-[5px] text-[12.5px] font-medium text-[color:var(--text-1)] opacity-0 shadow-[var(--shadow-soft)] transition duration-150 group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100">
          {def.label}
        </div>
      ) : null}
    </div>
  );
}
