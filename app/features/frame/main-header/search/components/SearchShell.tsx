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
        "app-rounded shadow-soft relative flex h-full flex-col overflow-hidden transition-[padding,background-color] duration-400 ease-in-out",
        isOpen ? "bg-bg-gradient-start p-5" : "bg-transparent p-0"
      )}
    >
      {children}
    </div>
  );
}
