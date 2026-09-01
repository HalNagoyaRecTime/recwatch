import {
  createElement,
  forwardRef,
  useRef,
  useState,
  type ComponentType,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type ElementType,
} from "react";
import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
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
  /** 矢印キーでaction項目を移動するメニューです。 */
  keyboardNavigation?: boolean;
};

/**
 * 1階層のシンプルなリスト（メニュー）を描画する汎用コンポーネントです。
 * 項目は配列（items）として渡し、データ駆動で描画します。
 */
export function Menu({ items, keyboardNavigation = false }: MenuProps) {
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const actionItems = items.filter(
    (item) => item.type === "action" && !item.disabled
  );
  const actionIndexById = new Map(
    actionItems.map((item, index) => [item.id, index])
  );

  const moveAction = (nextIndex: number) => {
    setActiveActionIndex(nextIndex);
    actionRefs.current[nextIndex]?.focus();
  };

  const getActionKeyDown = (index: number) => {
    if (!keyboardNavigation) {
      return undefined;
    }

    return (event: KeyboardEvent<HTMLButtonElement>) => {
      const actionCount = actionItems.length;
      if (actionCount === 0) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        moveAction((index + direction + actionCount) % actionCount);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        moveAction(event.key === "Home" ? 0 : actionCount - 1);
      }
    };
  };

  return (
    <FloatingListSurface role={keyboardNavigation ? "menu" : undefined}>
      {items.map((item) => {
        if (item.type === "custom") {
          return <div key={item.id}>{item.content}</div>;
        }

        if (item.type === "divider") {
          return (
            <div key={item.id} className="bg-border-subtle mx-1 my-1.5 h-px" />
          );
        }

        const currentActionIndex = actionIndexById.get(item.id);
        return (
          <MenuActionItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            endIcon={item.endIcon}
            danger={item.danger}
            disabled={item.disabled}
            onKeyDown={
              currentActionIndex === undefined
                ? undefined
                : getActionKeyDown(currentActionIndex)
            }
            onClick={item.onClick}
            ref={(element) => {
              if (currentActionIndex !== undefined) {
                actionRefs.current[currentActionIndex] = element;
              }
            }}
            tabIndex={
              keyboardNavigation
                ? currentActionIndex === activeActionIndex
                  ? 0
                  : -1
                : undefined
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
  onClick?: () => void;
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
