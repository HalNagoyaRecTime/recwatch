const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 100;

type LoadAllPagesOptions<T> = {
  maxPages?: number;
  pageSize?: number;
  /**
   * 取得したページを受け取り、true を返したらそこで取得を止める。
   * 探しているデータが見つかった時点で打ち切りたい場合に使う。
   */
  stopWhen?: (page: T[]) => boolean;
};

export async function loadAllPages<T>(
  loadPage: (offset: number, limit: number) => Promise<T[]>,
  options: LoadAllPagesOptions<T> = {}
): Promise<T[]> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const items: T[] = [];

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const page = await loadPage(items.length, pageSize);
    items.push(...page);

    if (page.length < pageSize || options.stopWhen?.(page)) {
      return items;
    }
  }

  throw new Error("一覧データの取得上限を超えました。");
}
