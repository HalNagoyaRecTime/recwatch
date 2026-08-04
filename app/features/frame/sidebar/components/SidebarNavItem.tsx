import { NavLink } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { useSidebarState } from "~/hooks/useSidebarState";
import { cn } from "~/lib/cn";
import { actionListItemStyle } from "~/components/ui/styles/action-list-styles";
import type { SidebarItemDef } from "~/types/sidebar";
import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";
import { isSidebarItemActive } from "~/features/frame/sidebar/utils/sidebar-active-matcher";

// --- 外部から呼ばれるメインコンポーネント ---

export function SidebarNavItem({
  item,
  pathname,
  depth = 0,
}: {
  item: SidebarItemDef;
  pathname: string;
  depth?: number;
}) {
  const hasChildren = Boolean(item.children?.length);

  if (hasChildren) {
    return <NavFolder item={item} pathname={pathname} depth={depth} />;
  }

  return <NavLinkItem item={item} pathname={pathname} depth={depth} />;
}

// --- ファイル内専用の部品コンポーネント ---

type NavFolderProps = {
  item: SidebarItemDef;
  pathname: string;
  depth: number;
};

function NavFolder({ item, pathname, depth }: NavFolderProps) {
  const { isExpanded } = useSidebarUI();
  const { openAccordions, toggleAccordion, closeForMobile } = useSidebarState();

  const isAccordionOpen = openAccordions.includes(item.id);
  const isActive = isSidebarItemActive(item, pathname);

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
          depth={depth}
        />
      </button>

      {!isExpanded && (
        <NavPopup item={item} pathname={pathname} closeMenu={closeForMobile} />
      )}

      <NavAccordion
        item={item}
        isOpen={isExpanded && isAccordionOpen}
        pathname={pathname}
        depth={depth}
      />
    </div>
  );
}

type NavLinkItemProps = {
  item: SidebarItemDef;
  pathname: string;
  depth: number;
};

function NavLinkItem({ item, pathname, depth }: NavLinkItemProps) {
  const { isExpanded } = useSidebarUI();
  const { closeForMobile } = useSidebarState();
  const isActive = isSidebarItemActive(item, pathname);

  if (!item.to) return null;

  return (
    <div className="group/nav relative">
      <NavLink
        to={item.to}
        end
        aria-current={isActive ? "page" : undefined}
        className={() =>
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
        <NavTriggerContent item={item} isExpanded={isExpanded} depth={depth} />
      </NavLink>

      {!isExpanded && (
        <NavPopup item={item} pathname={pathname} closeMenu={closeForMobile} />
      )}
    </div>
  );
}

type NavTriggerContentProps = {
  item: SidebarItemDef;
  isExpanded: boolean;
  isAccordionOpen?: boolean;
  hasChildren?: boolean;
  depth?: number;
};

function NavTriggerContent({
  item,
  isExpanded,
  isAccordionOpen = false,
  hasChildren = false,
  depth = 0,
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
          !item.icon && depth === 0 && "pl-2" // アイコンなし・第1子階層のみ左余白
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
  pathname: string;
  closeMenu: () => void;
};

function NavPopup({ item, pathname, closeMenu }: NavPopupProps) {
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
                  pathname={pathname}
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
  pathname,
  closeMenu,
  depth = 0,
}: {
  item: SidebarItemDef;
  pathname: string;
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
            pathname={pathname}
            closeMenu={closeMenu}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  if (!item.to) return null;

  const isActive = isSidebarItemActive(item, pathname);

  return (
    <NavLink
      to={item.to}
      end
      aria-current={isActive ? "page" : undefined}
      className={() => cn(actionListItemStyle({ active: isActive }), "w-full")}
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
  depth: number;
};

function NavAccordion({ item, isOpen, pathname, depth }: NavAccordionProps) {
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
          <SidebarNavItem
            key={child.id}
            item={child}
            pathname={pathname}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}
