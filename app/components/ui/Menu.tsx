import { ChevronRightIcon } from "lucide-react";
import type { ReactNode, ElementType } from "react";
import { cn } from "~/lib/cn";

export type MenuItemType =
  | {
      type: "action";
      id: string;
      label: string;
      icon?: ElementType;
      danger?: boolean;
      onClick?: () => void;
    }
  | {
      type: "submenu";
      id: string;
      label: string;
      icon?: ElementType;
      children: MenuItemType[];
    }
  | {
      type: "divider";
      id: string;
    }
  | {
      type: "custom";
      id: string;
      content: ReactNode;
    };

type MenuProps = {
  items: MenuItemType[];
  className?: string;
};

export function Menu({ items, className }: MenuProps) {
  return (
    <div
      className={cn(
        "border-border-2 bg-surface-overlay-strong shadow-soft min-w-50 rounded-xl border p-2 backdrop-blur-xl",
        className
      )}
    >
      {items.map((item) => {
        if (item.type === "custom") {
          return <div key={item.id}>{item.content}</div>;
        }

        if (item.type === "divider") {
          return <div key={item.id} className="bg-border-1 mx-1 my-1.5 h-px" />;
        }

        if (item.type === "submenu") {
          return (
            <div key={item.id} className="group relative">
              <button
                type="button"
                className="text-text-1 hover:bg-surface-2 flex h-8.5 w-full cursor-pointer items-center justify-between gap-2.5 rounded-md bg-transparent px-2.5 text-left text-sm transition"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <item.icon size={14} strokeWidth={1.8} />}
                  <span className="app-text-small">{item.label}</span>
                </div>
                <ChevronRightIcon
                  size={14}
                  strokeWidth={1.8}
                  className="text-text-3"
                />
              </button>

              <div className="absolute top-0 right-0 z-10 hidden translate-x-full pl-1 group-hover:block">
                <Menu items={item.children} />
              </div>
            </div>
          );
        }

        return (
          <button
            type="button"
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md bg-transparent px-2.5 text-left text-sm transition",
              item.danger
                ? "text-red-400 hover:bg-red-500/5"
                : "text-text-1 hover:bg-surface-2"
            )}
          >
            {item.icon && <item.icon size={14} strokeWidth={1.8} />}
            <span className="app-text-small">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
