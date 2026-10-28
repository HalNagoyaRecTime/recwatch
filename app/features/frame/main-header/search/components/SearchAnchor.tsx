import type { ReactNode, Ref } from "react";

type SearchAnchorProps = {
  anchorRef: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export function SearchAnchor({ anchorRef, children }: SearchAnchorProps) {
  return (
    <div ref={anchorRef} className="hidden h-full w-50 shrink-0 md:block">
      {children}
    </div>
  );
}
