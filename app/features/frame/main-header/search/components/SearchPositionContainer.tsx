import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

type SearchPositionContainerProps = {
  children: ReactNode;
  height: number;
  right: number;
  top: number | string;
  width: number;
  transform: string;
};

export function SearchPositionContainer({
  children,
  height,
  right,
  top,
  width,
  transform,
}: SearchPositionContainerProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-130 hidden md:block">
      <div
        className={cn(
          "pointer-events-auto absolute z-10 transition-[top,right,width,height,transform] duration-400 ease-in-out"
        )}
        style={{
          right,
          top,
          height,
          width,
          transform,
        }}
      >
        {children}
      </div>
    </div>
  );
}
