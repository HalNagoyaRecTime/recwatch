import { useCallback, useState } from "react";

/**
 * 更新の競合後に読み直した値を保持する。
 * ルートの再検証は取得に失敗するとエラー画面へ切り替わり入力を失うため、直接取得する。
 * 失敗は呼び出し側へ投げるので、編集中のフォームはそのまま残る。
 */
export function useLatestAfterConflict<T>(
  loaded: T,
  loadLatest: () => Promise<T>
) {
  const [latest, setLatest] = useState<{ base: T; value: T } | null>(null);

  const reloadLatest = useCallback(async () => {
    const value = await loadLatest();
    setLatest({ base: loaded, value });
  }, [loaded, loadLatest]);

  // ルートのデータが読み直されたら、そちらのほうが新しい。
  return {
    current: latest?.base === loaded ? latest.value : loaded,
    reloadLatest,
  };
}
