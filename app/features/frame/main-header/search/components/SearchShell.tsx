import type { ReactNode, Ref } from "react";
import { cn } from "~/lib/cn";

type SearchShellProps = {
  children: ReactNode;
  rootRef?: Ref<HTMLDivElement>;
  isOpen: boolean;
};

export function SearchShell({ children, rootRef, isOpen }: SearchShellProps) {
  return (
    <div
      ref={rootRef}
      className={cn(
        "app-rounded relative flex h-full flex-col overflow-hidden shadow-(--shadow-soft) transition-[padding,background-color] duration-400 ease-in-out",
        isOpen ? "bg-(--bg-top) p-5" : "bg-transparent p-0"
      )}
    >
      {children}
    </div>
  );
}
