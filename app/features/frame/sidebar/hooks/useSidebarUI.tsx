import { createContext, useContext, useState, type ReactNode } from "react";
import { useSidebarState } from "~/hooks/useSidebarState";

/**
 * サイドバーのホバー状態や、それに基づく最終的な表示幅（isExpanded）を表すデータ型です。
 */
type SidebarUIState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
  isExpanded: boolean;
};

/**
 * ナビゲーションのローカルなUI状態（ホバー等）を共有するためのContextオブジェクトです。
 */
const SidebarUIContext = createContext<SidebarUIState | undefined>(undefined);

/**
 * ナビゲーションへのホバー状態を管理し、`isExpanded`（広く見せるべきか）の最終判定を行うProviderです。
 * ナビゲーション内部（SidebarShell等）をラップするために使用します。
 */
export function SidebarUIProvider({ children }: { children: ReactNode }) {
  const [isHovering, setHovering] = useState(false);
  const { isOpen } = useSidebarState();

  // 常に開いた状態にピン留めされているか、または一時的にホバーされている場合は広く見せる
  const isExpanded = isOpen || isHovering;

  return (
    <SidebarUIContext.Provider value={{ isHovering, setHovering, isExpanded }}>
      {children}
    </SidebarUIContext.Provider>
  );
}

/**
 * ナビゲーション（サイドバー）の視覚的な表示状態を制御するフックです。
 *
 * 「現在マウスが乗っているか（ホバー状態）」と、グローバルなピン留め状態を組み合わせて、
 * 最終的に「サイドバーを広く表示すべきか（isExpanded）」を決定します。
 * ロゴやメニュー項目など、サイドバー内部の各コンポーネントが自身の見た目を切り替えるために参照します。
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSidebarUI() {
  const context = useContext(SidebarUIContext);
  if (!context) {
    throw new Error(
      "useSidebarUI は SidebarUIProvider の内側で使用する必要があります"
    );
  }
  return context;
}
