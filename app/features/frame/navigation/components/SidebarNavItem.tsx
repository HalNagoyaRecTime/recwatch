import { NavLink } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import { useNavigationUI } from "~/features/frame/navigation/hooks/useNavigationUI";
import { useNavState } from "~/hooks/useNavState";
import { cn } from "~/lib/cn";
import { actionListItemStyle } from "~/components/ui/styles/action-list-styles";
import type { NavItemDef, NavChildDef } from "~/types/nav";
import { NAV_TRANSITION } from "./nav-animations";

// パスの一致判定ユーティリティ
function pathMatches(pathname: string, to: string) {
  if (to === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

// --- 外部から呼ばれるメインコンポーネント ---

export function SidebarNavItem({
  item,
  pathname,
}: {
  item: NavItemDef;
  pathname: string;
}) {
  const hasChildren = Boolean(item.children?.length);

  if (hasChildren) {
    return <NavFolder item={item} pathname={pathname} />;
  }

  return <NavLinkItem item={item} />;
}

// --- ファイル内専用の部品コンポーネント ---

type NavFolderProps = {
  item: NavItemDef;
  pathname: string;
};

function NavFolder({ item, pathname }: NavFolderProps) {
  const { isExpanded } = useNavigationUI();
  const { openAccordions, toggleAccordion, closeForMobile } = useNavState();

  const isAccordionOpen = openAccordions.includes(item.id);
  const hasActiveChild =
    item.children?.some((child) => pathMatches(pathname, child.to)) ?? false;

  const handleToggle = () => {
    if (isExpanded) toggleAccordion(item.id);
  };

  return (
    <div className="group/nav relative">
      <button
        type="button"
        className={cn(
          actionListItemStyle({ intent: "nav", active: false }),
          "w-full",
          NAV_TRANSITION,
          !isExpanded && "gap-0 pr-0 pl-3",
          hasActiveChild && "hover:bg-transparent"
        )}
        onClick={handleToggle}
      >
        <NavTriggerContent
          item={item}
          isExpanded={isExpanded}
          isAccordionOpen={isAccordionOpen}
          hasChildren={true}
        />
      </button>

      {!isExpanded && <NavPopup item={item} closeMenu={closeForMobile} />}

      {isExpanded && (
        <NavAccordion
          item={item}
          isOpen={isAccordionOpen}
          closeMenu={closeForMobile}
        />
      )}
    </div>
  );
}

type NavLinkItemProps = {
  item: NavItemDef;
};

function NavLinkItem({ item }: NavLinkItemProps) {
  const { isExpanded } = useNavigationUI();
  const { closeForMobile } = useNavState();

  if (!item.to) return null;

  return (
    <div className="group/nav relative">
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            actionListItemStyle({ intent: "nav", active: isActive }),
            "w-full",
            NAV_TRANSITION,
            !isExpanded && "gap-0 pr-0 pl-3"
          )
        }
        onClick={closeForMobile}
      >
        <NavTriggerContent item={item} isExpanded={isExpanded} />
      </NavLink>

      {!isExpanded && <NavPopup item={item} closeMenu={closeForMobile} />}
    </div>
  );
}

type NavTriggerContentProps = {
  item: NavItemDef;
  isExpanded: boolean;
  isAccordionOpen?: boolean;
  hasChildren?: boolean;
};

function NavTriggerContent({
  item,
  isExpanded,
  isAccordionOpen = false,
  hasChildren = false,
}: NavTriggerContentProps) {
  return (
    <>
      <span className="inline-flex w-4 min-w-4 items-center justify-center">
        {item.icon}
      </span>
      <span
        className={cn(
          "overflow-hidden text-[13px] font-medium whitespace-nowrap",
          NAV_TRANSITION,
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
            "ml-auto text-(--text-3)",
            NAV_TRANSITION,
            isExpanded ? "opacity-100" : "hidden",
            isAccordionOpen ? "rotate-90" : ""
          )}
        />
      )}
    </>
  );
}

type NavPopupProps = {
  item: NavItemDef;
  closeMenu: () => void;
};

function NavPopup({ item, closeMenu }: NavPopupProps) {
  const hasChildren = Boolean(item.children?.length);

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 left-[66px] z-100 min-w-[180px] translate-x-[-4px] opacity-0 shadow-(--shadow-soft)",
        NAV_TRANSITION,
        "group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
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
                <NavSubItem key={child.id} item={child} onClick={closeMenu} />
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
}

type NavAccordionProps = {
  item: NavItemDef;
  isOpen: boolean;
  closeMenu: () => void;
};

function NavAccordion({ item, isOpen, closeMenu }: NavAccordionProps) {
  if (!item.children) return null;

  return (
    <div
      className={cn(
        "ml-[17.5px] overflow-hidden border-l border-(--border-1) pl-[7.5px]",
        NAV_TRANSITION,
        isOpen ? "visible max-h-[400px]" : "invisible max-h-0"
      )}
    >
      {item.children.map((child) => (
        <NavSubItem key={child.id} item={child} onClick={closeMenu} />
      ))}
    </div>
  );
}

type NavSubItemProps = {
  item: NavChildDef;
  onClick?: () => void;
};

function NavSubItem({ item, onClick }: NavSubItemProps) {
  if (!item.to) return null;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        actionListItemStyle({ intent: "nav", active: isActive })
      }
      onClick={onClick}
    >
      <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
        {item.label}
      </span>
    </NavLink>
  );
}
