import type { Ref } from "react";

type SearchAnchorProps = {
  anchorRef: Ref<HTMLDivElement>;
};

export function SearchAnchor({ anchorRef }: SearchAnchorProps) {
  return (
    <div
      ref={anchorRef}
      data-search-anchor
      className="h-full w-8 shrink-0 md:w-50"
    />
  );
}
