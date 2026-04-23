import type { Ref } from "react";

type SearchAnchorProps = {
  anchorRef: Ref<HTMLDivElement>;
};

export function SearchAnchor({ anchorRef }: SearchAnchorProps) {
  return (
    <div ref={anchorRef} className="hidden h-full w-50 shrink-0 md:block" />
  );
}
