import type { ReactNode } from "react";
import { cn } from "~/lib/cn";
import type { SearchFrame } from "~/features/frame/main-header/search/model/search-geometry";

type SearchPositionContainerProps = {
  children: ReactNode;
  frame: SearchFrame;
  geometryTransitionEnabled: boolean;
  positionRef: (node: HTMLDivElement | null) => void;
  onGeometryTransitionEnd: (propertyName: string) => void;
};

export function SearchPositionContainer({
  children,
  frame,
  geometryTransitionEnabled,
  positionRef,
  onGeometryTransitionEnd,
}: SearchPositionContainerProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-130">
      <div
        ref={positionRef}
        data-search-position
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget) {
            onGeometryTransitionEnd(event.propertyName);
          }
        }}
        className={cn(
          "pointer-events-auto absolute z-10 motion-reduce:transition-none",
          geometryTransitionEnabled
            ? "transition-[top,left,width,height] duration-400 ease-in-out"
            : "transition-none"
        )}
        style={{
          left: frame.left,
          top: frame.top,
          height: frame.height,
          width: frame.width,
        }}
      >
        {children}
      </div>
    </div>
  );
}
