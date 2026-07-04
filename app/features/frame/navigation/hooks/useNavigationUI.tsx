import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavState } from "~/hooks/useNavState";

/**
 * サイドバーのホバー状態や、それに基づく最終的な表示幅（isExpanded）を表すデータ型です。
 */
type NavigationUIState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
  isExpanded: boolean;
};

/**
 * ナビゲーションのローカルなUI状態（ホバー等）を共有するためのContextオブジェクトです。
 */
const NavigationUIContext = createContext<NavigationUIState | undefined>(
  undefined
);

/**
 * ナビゲーションへのホバー状態を管理し、`isExpanded`（広く見せるべきか）の最終判定を行うProviderです。
 * ナビゲーション内部（NavigationShell等）をラップするために使用します。
 */
export function NavigationUIProvider({ children }: { children: ReactNode }) {
  const [isHovering, setHovering] = useState(false);
  const { isOpen } = useNavState();

  // 常に開いた状態にピン留めされているか、または一時的にホバーされている場合は広く見せる
  const isExpanded = isOpen || isHovering;

  return (
    <NavigationUIContext.Provider
      value={{ isHovering, setHovering, isExpanded }}
    >
      {children}
    </NavigationUIContext.Provider>
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
export function useNavigationUI() {
  const context = useContext(NavigationUIContext);
  if (!context) {
    throw new Error(
      "useNavigationUI は NavigationUIProvider の内側で使用する必要があります"
    );
  }
  return context;
}
