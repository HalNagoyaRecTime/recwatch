const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 100;

type Page<T> = {
  items: T[];
  total: number;
};

type LoadAllPagesOptions = {
  maxPages?: number;
  pageSize?: number;
};

export async function loadAllPages<T>(
  loadPage: (offset: number, limit: number) => Promise<Page<T>>,
  options: LoadAllPagesOptions = {}
): Promise<T[]> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const items: T[] = [];

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const page = await loadPage(items.length, pageSize);
    items.push(...page.items);

    if (page.items.length === 0 || items.length >= page.total) {
      return items;
    }
  }

  throw new Error("一覧データの取得上限を超えました。");
}
