import type { ReactNode } from "react";

import { cn } from "~/lib/cn";

type SearchExpandedBodyProps = {
  children: ReactNode;
  isOpen: boolean;
};

export function SearchExpandedBody({
  children,
  isOpen,
}: SearchExpandedBodyProps) {
  return (
    <div
      aria-hidden={isOpen ? undefined : true}
      inert={!isOpen}
      className={cn(
        "grid min-h-0 overflow-hidden transition-[grid-template-rows,opacity,margin-top] duration-400 ease-in-out motion-reduce:transition-none",
        isOpen
          ? "mt-3 flex-1 grid-rows-[1fr] opacity-100"
          : "mt-0 grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
