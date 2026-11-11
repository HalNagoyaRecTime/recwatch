import type { ReactNode, Ref } from "react";

type SearchAnchorProps = {
  anchorRef: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export function SearchAnchor({ anchorRef, children }: SearchAnchorProps) {
  return (
    <div
      ref={anchorRef}
      data-search-anchor
      className="h-full w-8 shrink-0 md:w-50"
    >
      {children}
    </div>
  );
}
