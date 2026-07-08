import type { ReactNode, ElementType, ComponentProps } from "react";
import { cn } from "~/lib/cn";
import {
  actionListContainerStyle,
  actionListItemStyle,
} from "~/components/ui/styles/action-list-styles";

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
      endIcon?: ElementType | ReactNode;
      danger?: boolean;
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
  className?: string;
};

/**
 * 1階層のシンプルなリスト（メニュー）を描画する汎用コンポーネントです。
 * 項目は配列（items）として渡し、データ駆動で描画します。
 */
export function Menu({ items, className }: MenuProps) {
  return (
    <div className={cn(actionListContainerStyle, className)}>
      {items.map((item) => {
        if (item.type === "custom") {
          return <div key={item.id}>{item.content}</div>;
        }

        if (item.type === "divider") {
          return <div key={item.id} className="bg-border-1 mx-1 my-1.5 h-px" />;
        }

        return (
          <MenuActionItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            endIcon={item.endIcon}
            danger={item.danger}
            onClick={item.onClick}
          />
        );
      })}
    </div>
  );
}

type MenuActionItemProps = ComponentProps<"button"> & {
  label: string;
  icon?: ElementType;
  endIcon?: ElementType | ReactNode;
  danger?: boolean;
};

/**
 * メニューの「1項目」単体のUIコンポーネント。
 * `Menu` コンポーネント内部で使用されるほか、`custom` 枠の中で
 * ポップオーバー（FloatingPanel）を開くためのトリガーボタン等として、
 * 他の項目と見た目を揃えたい時にも使用できます。
 */
export function MenuActionItem({
  label,
  icon: Icon,
  endIcon,
  danger,
  className,
  ref,
  ...props
}: MenuActionItemProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        actionListItemStyle({
          intent: danger ? "danger" : "primary",
        }),
        endIcon ? "justify-between" : undefined,
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={14} strokeWidth={1.8} className="shrink-0" />}
        <span className="app-text-small whitespace-nowrap">{label}</span>
      </div>
      {endIcon && (
        <div className="text-text-3 flex shrink-0 items-center justify-center">
          {typeof endIcon === "function"
            ? (() => {
                const EndIcon = endIcon;
                return <EndIcon size={14} strokeWidth={1.8} />;
              })()
            : endIcon}
        </div>
      )}
    </button>
  );
}
