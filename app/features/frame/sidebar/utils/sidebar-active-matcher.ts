import { matchPath } from "react-router";

import type { SidebarItemDef } from "~/types/sidebar";

/**
 * Returns whether a sidebar item represents the current route.
 *
 * `to` is the navigation destination. `activePatterns` can additionally
 * describe detail/edit routes that should keep the parent page selected.
 */
export function isSidebarItemActive(
  item: SidebarItemDef,
  pathname: string
): boolean {
  if (
    item.activeExclusions?.some((pattern) =>
      Boolean(matchPath({ path: pattern, end: true }, pathname))
    )
  ) {
    return false;
  }

  const patterns = item.activePatterns?.length
    ? item.activePatterns
    : item.to
      ? [item.to]
      : [];

  if (
    patterns.some((pattern) =>
      Boolean(matchPath({ path: pattern, end: true }, pathname))
    )
  ) {
    return true;
  }

  return (
    item.children?.some((child) => isSidebarItemActive(child, pathname)) ??
    false
  );
}
