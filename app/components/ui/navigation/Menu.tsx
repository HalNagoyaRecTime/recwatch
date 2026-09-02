import {
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ComponentPropsWithoutRef,
  type KeyboardEventHandler,
  type ReactNode,
  type ElementType,
} from "react";
import {
  useListNavigation,
  type ElementProps,
  type FloatingRootContext,
} from "@floating-ui/react";
import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
import { FloatingPanelContext } from "~/components/ui/panel/FloatingPanelContext";
import { cn } from "~/lib/cn";
import { floatingListActionItemStyle } from "~/components/ui/panel/styles/floating-list-styles";

type MenuIconComponent = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
}>;

/**
 * メニュー項目のデータ構造を定義します。
 * サブメニューなどの複雑なネストは、Menu自身に担わせるのではなく、
 * `custom` タイプと `FloatingPanel` などを組み合わせて実現してください。
 */
export type MenuItemType =
  | {
      /** 通常のクリック可能なボタン項目 */
      type: "action";
      id: string;
      label: string;
      icon?: ElementType;
      endIcon?: MenuIconComponent | ReactNode;
      danger?: boolean;
      disabled?: boolean;
      onClick?: () => void;
      onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    }
  | {
      /** 区切り線 */
      type: "divider";
      id: string;
    }
  | {
      /**
       * 自由にUIを組み込める拡張枠。
       * サブメニューのトリガー（FloatingPanel等）や、特殊なUIを配置したい場合に使用します。
       */
      type: "custom";
      id: string;
      content: ReactNode;
    };

type MenuProps = {
  items: MenuItemType[];
  /** Floating UIのリストナビゲーションを有効にします。 */
  listNavigation?: boolean;
  /** 表示時または切り替え時に指定したaction項目へフォーカスします。 */
  focusActionIndex?: number;
  /** 同じ項目へ再度フォーカスするための要求番号です。 */
  focusActionRequest?: number;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
};

/**
 * 1階層のシンプルなリスト（メニュー）を描画する汎用コンポーネントです。
 * 項目は配列（items）として渡し、データ駆動で描画します。
 */
export function Menu({
  items,
  listNavigation = false,
  focusActionIndex,
  focusActionRequest,
  onKeyDown,
}: MenuProps) {
  const context = useContext(FloatingPanelContext);

  if (listNavigation && context) {
    return (
      <NavigatedMenu
        context={context}
        focusActionIndex={focusActionIndex}
        focusActionRequest={focusActionRequest}
        items={items}
        onKeyDown={onKeyDown}
      />
    );
  }

  return <MenuContent items={items} onKeyDown={onKeyDown} />;
}

type NavigatedMenuProps = MenuProps & {
  context: FloatingRootContext;
};

function NavigatedMenu({
  context,
  focusActionIndex,
  focusActionRequest,
  items,
  onKeyDown,
}: NavigatedMenuProps) {
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigation = useListNavigation(context, {
    activeIndex,
    focusItemOnOpen: focusActionIndex !== undefined ? true : "auto",
    listRef,
    loop: true,
    nested: false,
    onNavigate: setActiveIndex,
    selectedIndex: focusActionIndex ?? null,
  });

  useEffect(() => {
    if (focusActionIndex === undefined) {
      return;
    }

    listRef.current[focusActionIndex]?.focus();
  }, [focusActionIndex, focusActionRequest]);

  return (
    <MenuContent
      items={items}
      listRef={listRef}
      navigation={navigation}
      onKeyDown={onKeyDown}
    />
  );
}

type MenuContentProps = Pick<MenuProps, "items" | "onKeyDown"> & {
  listRef?: import("react").MutableRefObject<Array<HTMLElement | null>>;
  navigation?: ElementProps;
};

function MenuContent({
  items,
  listRef,
  navigation,
  onKeyDown,
}: MenuContentProps) {
  const actionItems = items.filter(
    (item) => item.type === "action" && !item.disabled
  );

  const navigationOnKeyDown = navigation?.floating?.onKeyDown as
    | KeyboardEventHandler<HTMLDivElement>
    | undefined;

  return (
    <FloatingListSurface
      {...navigation?.floating}
      onKeyDown={(event) => {
        navigationOnKeyDown?.(event);
        if (!event.defaultPrevented) {
          onKeyDown?.(event);
        }
      }}
    >
      {items.map((item) => {
        if (item.type === "custom") {
          return <div key={item.id}>{item.content}</div>;
        }

        if (item.type === "divider") {
          return (
            <div key={item.id} className="bg-border-subtle mx-1 my-1.5 h-px" />
          );
        }

        const currentActionIndex = listRef
          ? actionItems.indexOf(item)
          : undefined;
        const navigationItemProps =
          typeof navigation?.item === "function" ? undefined : navigation?.item;
        const navigationItemOnClick = navigationItemProps?.onClick as
          | ComponentPropsWithoutRef<"button">["onClick"]
          | undefined;
        return (
          <MenuActionItem
            {...navigationItemProps}
            key={item.id}
            label={item.label}
            icon={item.icon}
            endIcon={item.endIcon}
            danger={item.danger}
            disabled={item.disabled}
            data-menu-item-id={item.id}
            onKeyDown={item.onKeyDown}
            onClick={(event) => {
              navigationItemOnClick?.(event);
              item.onClick?.();
            }}
            ref={(element) => {
              if (listRef && currentActionIndex !== undefined) {
                listRef.current[currentActionIndex] = element;
              }
            }}
            className={
              navigation ? "focus-visible:bg-surface-hover" : undefined
            }
          />
        );
      })}
    </FloatingListSurface>
  );
}

type MenuActionItemProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "type"
> & {
  label: string;
  icon?: ElementType;
  endIcon?: MenuIconComponent | ReactNode;
  danger?: boolean;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
};

/**
 * メニューの「1項目」単体のUIコンポーネント。
 * `Menu` コンポーネント内部で使用されるほか、`custom` 枠の中で
 * ポップオーバー（FloatingPanel）を開くためのトリガーボタン等として、
 * 他の項目と見た目を揃えたい時にも使用できます。
 */
export const MenuActionItem = forwardRef<
  HTMLButtonElement,
  MenuActionItemProps
>(function MenuActionItem(
  { label, icon: Icon, endIcon, danger, className, ...buttonProps },
  ref
) {
  const EndIcon = typeof endIcon === "function" ? endIcon : undefined;

  return (
    <button
      ref={ref}
      type="button"
      {...buttonProps}
      className={cn(
        floatingListActionItemStyle({
          intent: danger ? "danger" : "default",
        }),
        endIcon ? "justify-between" : undefined,
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={14} strokeWidth={1.8} className="shrink-0" />}
        <span className="app-text-small whitespace-nowrap">{label}</span>
      </div>
      {endIcon && (
        <div className="text-text-subtle flex shrink-0 items-center justify-center">
          {EndIcon
            ? createElement(EndIcon, { size: 14, strokeWidth: 1.8 })
            : (endIcon as ReactNode)}
        </div>
      )}
    </button>
  );
});
