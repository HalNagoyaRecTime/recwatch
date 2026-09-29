import type { AppRole } from "~/config/permissions";
import {
  navigationSections,
  type NavigationItemConfig,
} from "~/config/navigation";
import { canAccess } from "~/utils/permissions";

export type NavigationSearchResult = {
  id: string;
  title: string;
  category: string;
  to: string;
  keywords: readonly string[];
};

function collectSearchResults(
  item: NavigationItemConfig,
  role: AppRole,
  fallbackCategory: string,
  results: NavigationSearchResult[]
) {
  const category = item.searchCategory ?? fallbackCategory;

  if (item.to && item.searchable !== false && canAccess(role, item.roles)) {
    results.push({
      id: item.id,
      title: item.searchLabel ?? item.label,
      category,
      to: item.to,
      keywords: item.searchKeywords ?? [],
    });
  }

  item.children?.forEach((child) =>
    collectSearchResults(child, role, category, results)
  );
}

export function buildNavigationSearchResults(
  role: AppRole
): readonly NavigationSearchResult[] {
  const results: NavigationSearchResult[] = [];

  navigationSections.forEach((section) => {
    section.items.forEach((item) =>
      collectSearchResults(
        item,
        role,
        section.label ?? "ナビゲーション",
        results
      )
    );
  });

  return results;
}

const ADMIN_SEARCH_RESULTS = buildNavigationSearchResults("admin");

export function filterNavigationSearchResults(
  query: string,
  results: readonly NavigationSearchResult[] = ADMIN_SEARCH_RESULTS
): readonly NavigationSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja");

  if (!normalizedQuery) {
    return results;
  }

  return results.filter((result) =>
    [result.title, result.category, ...result.keywords].some((value) =>
      value.toLocaleLowerCase("ja").includes(normalizedQuery)
    )
  );
}
