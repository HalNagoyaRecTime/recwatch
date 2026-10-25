import { useEffect, useState } from "react";

/** 初回はSSRとそろえ、ブラウザーで分の境界ごとに現在時刻を更新する。 */
export function useCurrentMinute(): Date | null {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number;
    const refresh = () => {
      window.clearTimeout(timeoutId);
      setCurrentTime(new Date());
      timeoutId = window.setTimeout(refresh, 60_000 - (Date.now() % 60_000));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return currentTime;
}
