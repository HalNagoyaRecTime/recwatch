import { ChevronRightIcon } from "lucide-react";
import type { ReactNode, ElementType } from "react";
import { cn } from "~/lib/cn";
import { Popover } from "~/components/shared/Popover";
import {
  actionListContainerStyle,
  actionListItemStyle,
} from "./styles/action-list-styles";

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
    <div className={cn(actionListContainerStyle, className)}>
      {items.map((item) => {
        if (item.type === "custom") {
          return <div key={item.id}>{item.content}</div>;
        }

        if (item.type === "divider") {
          return <div key={item.id} className="bg-border-1 mx-1 my-1.5 h-px" />;
        }

        if (item.type === "submenu") {
          return (
            <Popover
              key={item.id}
              placement="right-start"
              interaction="hover"
              offsetValue={6}
              triggerClassName="w-full block"
              trigger={
                <button
                  type="button"
                  className={cn(actionListItemStyle(), "justify-between")}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon && (
                      <item.icon
                        size={14}
                        strokeWidth={1.8}
                        className="shrink-0"
                      />
                    )}
                    <span className="app-text-small whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRightIcon
                    size={14}
                    strokeWidth={1.8}
                    className="text-text-3 ml-4 shrink-0"
                  />
                </button>
              }
              content={<Menu items={item.children} />}
            />
          );
        }

        return (
          <button
            type="button"
            key={item.id}
            onClick={item.onClick}
            className={cn(
              actionListItemStyle({
                intent: item.danger ? "danger" : "primary",
              })
            )}
          >
            {item.icon && (
              <item.icon size={14} strokeWidth={1.8} className="shrink-0" />
            )}
            <span className="app-text-small whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
