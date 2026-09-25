import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";

import { AccountDeletionBrand } from "~/features/account-deletion/components/AccountDeletionBrand";
import { AccountDeletionFooter } from "~/features/account-deletion/components/AccountDeletionFooter";
import { applyTheme, isThemeMode } from "~/lib/theme";

type AccountDeletionLayoutProps = {
  children: ReactNode;
};

// 削除画面内の共通UIが参照する値。main配下だけに適用し、通常画面のテーマへ影響させない。
const accountDeletionThemeStyle = {
  "--surface-base": "#ffffff",
  "--surface-muted": "#f4f4f4",
  "--surface-hover": "#f4f4f4",
  "--border-base": "#dddfe1",
  "--border-strong": "#c5c7cc",
  "--text-base": "#333333",
  "--text-muted": "#808080",
  "--tone-success-text": "#15803d",
  "--tone-danger-bg": "rgba(239, 68, 68, 0.12)",
  "--tone-danger-border": "rgba(239, 68, 68, 0.28)",
  "--tone-danger-text": "#dc2626",
  "--tone-warning-text": "#d97706",
} as CSSProperties;

function useAccountDeletionFavicon() {
  useEffect(() => {
    const favicon =
      document.querySelector<HTMLLinkElement>('link[rel~="icon"]');

    if (!favicon) return;

    const previousHref = favicon.getAttribute("href");
    const previousType = favicon.getAttribute("type");
    const previousSizes = favicon.getAttribute("sizes");

    favicon.setAttribute("href", "/recreation-favicon.png");
    favicon.setAttribute("type", "image/png");
    favicon.setAttribute("sizes", "512x512");

    return () => {
      if (previousHref === null) {
        favicon.removeAttribute("href");
      } else {
        favicon.setAttribute("href", previousHref);
      }

      if (previousType === null) {
        favicon.removeAttribute("type");
      } else {
        favicon.setAttribute("type", previousType);
      }

      if (previousSizes === null) {
        favicon.removeAttribute("sizes");
      } else {
        favicon.setAttribute("sizes", previousSizes);
      }
    };
  }, []);
}

function useAccountDeletionDocumentBackground() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.documentBackgroundOverride = "#ffffff";
    root.style.setProperty("background-color", "#ffffff");

    return () => {
      delete root.dataset.documentBackgroundOverride;
      delete root.dataset.accountDeletionAuthCallback;
      const theme = root.dataset.theme ?? null;
      applyTheme(isThemeMode(theme) ? theme : "system");
    };
  }, []);
}

export function AccountDeletionLayout({
  children,
}: AccountDeletionLayoutProps) {
  useAccountDeletionFavicon();
  useAccountDeletionDocumentBackground();

  return (
    <main
      className="account-deletion-viewport viewport-min-height box-border flex flex-col items-center justify-center-safe bg-white text-[#333333]"
      style={{
        ...accountDeletionThemeStyle,
        paddingTop: "calc(2rem + env(safe-area-inset-top, 0px))",
        paddingRight: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "calc(1.5rem + env(safe-area-inset-left, 0px))",
      }}
    >
      <section className="flex w-full max-w-sm flex-1 flex-col justify-center gap-4">
        <AccountDeletionBrand />
        {children}
      </section>
      <AccountDeletionFooter />
    </main>
  );
}
