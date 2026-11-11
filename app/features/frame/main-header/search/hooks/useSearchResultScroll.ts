import { useEffect, useRef } from "react";

type UseSearchResultScrollParams = {
  selectedIndex: number;
};

export function useSearchResultScroll({
  selectedIndex,
}: UseSearchResultScrollParams) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [selectedIndex]);

  return {
    itemRefs,
  };
}
