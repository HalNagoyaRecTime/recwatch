import { useEffect, useRef } from "react";

type UseSearchResultScrollParams = {
  selectedIndex: number;
};

export function useSearchResultScroll({
  selectedIndex,
}: UseSearchResultScrollParams) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return {
    itemRefs,
  };
}
