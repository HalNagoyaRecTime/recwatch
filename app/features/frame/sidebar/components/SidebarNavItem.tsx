import { NavLink } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { useSidebarState } from "~/hooks/useSidebarState";
import { cn } from "~/lib/cn";
import { actionListItemStyle } from "~/components/ui/styles/action-list-styles";
import type { SidebarItemDef } from "~/types/sidebar";
import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

// パスの一致判定ユーティリティ
function pathMatches(pathname: string, to: string) {
  if (to === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

// 子孫要素のどれかがアクティブか再帰的に判定する
function hasActiveChild(item: SidebarItemDef, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some((child) => {
    if (child.to && pathMatches(pathname, child.to)) return true;
    if (child.children) return hasActiveChild(child, pathname);
    return false;
  });
}

// --- 外部から呼ばれるメインコンポーネント ---

export function SidebarNavItem({
  item,
  pathname,
}: {
  item: SidebarItemDef;
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
  item: SidebarItemDef;
  pathname: string;
};

function NavFolder({ item, pathname }: NavFolderProps) {
  const { isExpanded } = useSidebarUI();
  const { openAccordions, toggleAccordion, closeForMobile } = useSidebarState();

  const isAccordionOpen = openAccordions.includes(item.id);
  const isActive = hasActiveChild(item, pathname);

  const handleToggle = () => {
    if (isExpanded) toggleAccordion(item.id);
  };

  return (
    <div className="group/nav relative">
      <button
        type="button"
        className={cn(
          actionListItemStyle({ active: false }),
          "w-full",
          "transition-all",
          SIDEBAR_DURATION,
          !isExpanded && "gap-0 pr-0 pl-3",
          isActive && "hover:bg-transparent"
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

      <NavAccordion
        item={item}
        isOpen={isExpanded && isAccordionOpen}
        pathname={pathname}
      />
    </div>
  );
}

type NavLinkItemProps = {
  item: SidebarItemDef;
};

function NavLinkItem({ item }: NavLinkItemProps) {
  const { isExpanded } = useSidebarUI();
  const { closeForMobile } = useSidebarState();

  if (!item.to) return null;

  return (
    <div className="group/nav relative">
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            actionListItemStyle({ active: isActive }),
            "w-full",
            "transition-all",
            SIDEBAR_DURATION,
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
  item: SidebarItemDef;
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
      {item.icon && (
        <span className="inline-flex w-4 min-w-4 items-center justify-center">
          {item.icon}
        </span>
      )}
      <span
        className={cn(
          "overflow-hidden text-[13px] font-medium whitespace-nowrap",
          "transition-all",
          SIDEBAR_DURATION,
          isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
          !item.icon && "pl-2" // アイコンがない場合は少し左に余白
        )}
      >
        {item.label}
      </span>
      {hasChildren && (
        <ChevronRightIcon
          size={14}
          strokeWidth={1.8}
          className={cn(
            "text-text-3 ml-auto",
            "transition-all",
            SIDEBAR_DURATION,
            isExpanded ? "opacity-100" : "hidden",
            isAccordionOpen ? "rotate-90" : ""
          )}
        />
      )}
    </>
  );
}

type NavPopupProps = {
  item: SidebarItemDef;
  closeMenu: () => void;
};

function NavPopup({ item, closeMenu }: NavPopupProps) {
  const hasChildren = Boolean(item.children?.length);

  return (
    <div
      className={cn(
        "shadow-shadow-soft pointer-events-none absolute top-0 left-16.5 z-100 min-w-45 -translate-x-1 opacity-0",
        "transition-all",
        SIDEBAR_DURATION,
        "group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
      )}
    >
      <div className="border-border-2 bg-surface-overlay-strong rounded-lg border p-1">
        {hasChildren && item.children ? (
          <>
            <div className="text-text-1 flex items-center gap-2.5 px-2.5 pt-1 pb-2 text-[12.5px] font-semibold">
              {item.icon && (
                <span className="inline-flex w-4 min-w-4 items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </div>
            <div className="bg-border-1 mx-1 my-1 h-px" />
            <div className="flex flex-col">
              {item.children.map((child) => (
                <PopupNestedItem
                  key={child.id}
                  item={child}
                  closeMenu={closeMenu}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-text-1 px-2.75 py-1.25 text-[12.5px] font-medium">
            {item.label}
          </div>
        )}
      </div>
    </div>
  );
}

function PopupNestedItem({
  item,
  closeMenu,
  depth = 0,
}: {
  item: SidebarItemDef;
  closeMenu: () => void;
  depth?: number;
}) {
  if (item.children && item.children.length > 0) {
    return (
      <div className="flex flex-col">
        <div
          className="text-text-2 flex items-center gap-2 px-2.5 pt-1.5 pb-1 text-[12px] font-semibold tracking-wider uppercase"
          style={{ paddingLeft: `${10 + depth * 12}px` }}
        >
          {item.icon && (
            <span className="inline-flex w-3.5 min-w-3.5 items-center justify-center">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </div>
        {item.children.map((child) => (
          <PopupNestedItem
            key={child.id}
            item={child}
            closeMenu={closeMenu}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  if (!item.to) return null;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(actionListItemStyle({ active: isActive }), "w-full")
      }
      onClick={closeMenu}
      style={{ paddingLeft: `${10 + depth * 12}px` }}
    >
      <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
        {item.label}
      </span>
    </NavLink>
  );
}

type NavAccordionProps = {
  item: SidebarItemDef;
  isOpen: boolean;
  pathname: string;
};

function NavAccordion({ item, isOpen, pathname }: NavAccordionProps) {
  if (!item.children) return null;

  return (
    <div
      className={cn(
        "grid",
        "transition-all",
        SIDEBAR_DURATION,
        isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
      )}
    >
      <div className="border-border-1 ml-[17.5px] min-h-0 overflow-hidden border-l pl-[7.5px]">
        {item.children.map((child) => (
          <SidebarNavItem key={child.id} item={child} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}
