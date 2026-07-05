import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * アプリ全体のナビゲーション開閉状態を表すデータ型です。
 */
type SidebarState = {
  isOpen: boolean;
  openAccordions: string[];
  toggle: () => void;
  toggleAccordion: (id: string) => void;
  closeForMobile: () => void;
};

/**
 * ナビゲーションの開閉状態をコンポーネントツリー全体に共有するためのContextオブジェクトです。
 */
const SidebarStateContext = createContext<SidebarState | undefined>(undefined);

/**
 * ナビゲーション状態（開閉状態・アコーディオン）を管理し、セッションストレージと同期させるProviderです。
 * アプリのルート付近（AppShell等）で一度だけ呼び出されます。
 */
export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // アプリ起動時にセッションストレージから前回の状態を復元する
  useEffect(() => {
    const saved = sessionStorage.getItem("rectime-nav-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const stateData = parsed.state ? parsed.state : parsed;
        if (stateData.isOpen !== undefined) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsOpen(stateData.isOpen);
        }
        if (stateData.openAccordions !== undefined) {
          setOpenAccordions(stateData.openAccordions);
        }
      } catch (e) {
        console.error(
          "セッションストレージからのナビゲーション状態の復元に失敗しました",
          e
        );
      }
    }
    setIsLoaded(true);
  }, []);

  // 状態が変わるたびにセッションストレージに保存する
  useEffect(() => {
    if (!isLoaded) return;
    sessionStorage.setItem(
      "rectime-nav-state",
      // Zustand互換の形式で保存しておく（将来的な切り戻しも安全なように）
      JSON.stringify({ state: { isOpen, openAccordions }, version: 0 })
    );
  }, [isOpen, openAccordions, isLoaded]);

  const toggle = () => {
    setIsOpen((prevIsOpen) => {
      const nextIsOpen = !prevIsOpen;
      return nextIsOpen;
    });
    setOpenAccordions((prev) => {
      // サイドバーが閉じる時（現在の isOpen が true の時）にアコーディオンをすべて閉じる
      return isOpen ? [] : prev;
    });
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const closeForMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      setIsOpen(false);
      setOpenAccordions([]);
    }
  };

  return (
    <SidebarStateContext.Provider
      value={{
        isOpen,
        openAccordions,
        toggle,
        toggleAccordion,
        closeForMobile,
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  );
}

/**
 * アプリ全体のナビゲーション（サイドバー）の開閉状態を管理するフックです。
 *
 * ヘッダーのハンバーガーメニューや、サイドバー下部のトグルボタンなど、
 * アプリのどこからでもサイドバーの「ピン留め状態（開閉）」を操作・参照するために使用します。
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error(
      "useSidebarState は SidebarStateProvider の内側で使用する必要があります"
    );
  }
  return context;
}
