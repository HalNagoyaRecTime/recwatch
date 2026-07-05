import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { useSidebarState } from "~/hooks/useSidebarState";
import { cn } from "~/lib/cn";
import { actionListItemStyle } from "~/components/ui/styles/action-list-styles";
import type { SidebarItemDef, SidebarChildDef } from "~/types/sidebar";
import {
  SIDEBAR_DURATION,
  SIDEBAR_DURATION_MS,
} from "~/features/frame/sidebar/styles/sidebar-styles";

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
          actionListItemStyle({ active: false }),
          "w-full",
          "transition-all",
          SIDEBAR_DURATION,
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

      <NavAccordion
        item={item}
        isOpen={isExpanded && isAccordionOpen}
        closeMenu={closeForMobile}
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
      <span className="inline-flex w-4 min-w-4 items-center justify-center">
        {item.icon}
      </span>
      <span
        className={cn(
          "overflow-hidden text-[13px] font-medium whitespace-nowrap",
          "transition-all",
          SIDEBAR_DURATION,
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
        "shadow-shadow-soft pointer-events-none absolute top-0 left-[66px] z-100 min-w-[180px] translate-x-[-4px] opacity-0",
        "transition-all",
        SIDEBAR_DURATION,
        "group-hover/nav:pointer-events-auto group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
      )}
    >
      <div className="border-border-2 bg-surface-overlay-strong rounded-lg border p-1">
        {hasChildren && item.children ? (
          <>
            <div className="text-text-1 flex items-center gap-2.5 px-2.5 pt-1 pb-2 text-[12.5px] font-semibold">
              <span className="inline-flex w-4 min-w-4 items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            <div className="bg-border-1 mx-1 my-1 h-px" />
            <div className="flex flex-col">
              {item.children.map((child) => (
                <NavSubItem key={child.id} item={child} onClick={closeMenu} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-text-1 px-[11px] py-[5px] text-[12.5px] font-medium">
            {item.label}
          </div>
        )}
      </div>
    </div>
  );
}

type NavAccordionProps = {
  item: SidebarItemDef;
  isOpen: boolean;
  closeMenu: () => void;
};

function NavAccordion({ item, isOpen, closeMenu }: NavAccordionProps) {
  // DOMをマウントするかどうか
  const [mounted, setMounted] = useState(isOpen);
  // CSSの「開いた状態」を適用するかどうか。初期値は絶対にfalse（閉じた状態でDOMを作るため）
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    if (isOpen) {
      // 1. DOMを生成する
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      // 2. DOM生成（ブラウザの描画）を少し待ってから、CSSで「開く」
      timer1 = setTimeout(() => {
        setActive(true);
      }, 10);
    } else {
      // 1. CSSで「閉じる」
      setActive(false);
      // 2. アニメーション終了(SIDEBAR_DURATION_MS)を待ってから、DOMを破棄する
      timer2 = setTimeout(() => {
        setMounted(false);
      }, SIDEBAR_DURATION_MS);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!item.children || !mounted) return null;

  return (
    <div
      className={cn(
        "border-border-1 ml-[17.5px] overflow-hidden border-l pl-[7.5px]",
        "transition-all",
        SIDEBAR_DURATION,
        active ? "visible max-h-[400px]" : "invisible max-h-0"
      )}
    >
      {item.children.map((child) => (
        <NavSubItem key={child.id} item={child} onClick={closeMenu} />
      ))}
    </div>
  );
}

type NavSubItemProps = {
  item: SidebarChildDef;
  onClick?: () => void;
};

function NavSubItem({ item, onClick }: NavSubItemProps) {
  if (!item.to) return null;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => actionListItemStyle({ active: isActive })}
      onClick={onClick}
    >
      <span className="overflow-hidden text-[13px] font-medium whitespace-nowrap opacity-100">
        {item.label}
      </span>
    </NavLink>
  );
}
