import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";

import { AccountDeletionBrand } from "~/features/account-deletion/components/AccountDeletionBrand";
import { AccountDeletionFooter } from "~/features/account-deletion/components/AccountDeletionFooter";

type AccountDeletionLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

const accountDeletionThemeStyle = {
  "--bg-gradient-start": "#ffffff",
  "--bg-gradient-end": "#ffffff",
  "--bg-gradient-glow": "transparent",
  "--surface-layout": "#ffffff",
  "--surface-base": "#ffffff",
  "--surface-muted": "#f4f4f4",
  "--surface-subtle": "#bfbebe",
  "--surface-hover": "#f4f4f4",
  "--border-subtle": "#ececee",
  "--border-base": "#dddfe1",
  "--border-strong": "#c5c7cc",
  "--text-base": "#333333",
  "--text-muted": "#808080",
  "--text-subtle": "#808080",
  "--text-base-inverse": "#ffffff",
  "--text-muted-inverse": "#ffffff",
  "--text-subtle-inverse": "#ffffff",
  "--brand-primary": "#333333",
  "--button-brand-gradient-start": "#333333",
  "--button-brand-gradient-end": "#333333",
  "--tone-success-bg": "rgba(34, 197, 94, 0.12)",
  "--tone-success-bg-hover": "rgba(34, 197, 94, 0.2)",
  "--tone-success-border": "rgba(34, 197, 94, 0.28)",
  "--tone-success-text": "#15803d",
  "--tone-danger-bg": "rgba(239, 68, 68, 0.12)",
  "--tone-danger-bg-hover": "rgba(239, 68, 68, 0.2)",
  "--tone-danger-border": "rgba(239, 68, 68, 0.28)",
  "--tone-danger-text": "#dc2626",
  "--tone-warning-text": "#d97706",
  "--shadow-soft": "0 20px 45px rgba(15, 23, 42, 0.12)",
} as CSSProperties;

function useAccountDeletionFavicon() {
  useEffect(() => {
    const favicon =
      document.querySelector<HTMLLinkElement>('link[rel~="icon"]');

    if (!favicon) return;

    const previousHref = favicon.getAttribute("href");
    const previousType = favicon.getAttribute("type");
    const previousSizes = favicon.getAttribute("sizes");

    favicon.setAttribute("href", "/recreation-favicon.svg");
    favicon.setAttribute("type", "image/svg+xml");
    favicon.setAttribute("sizes", "any");

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

function useAccountDeletionViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const app = document.getElementById("app");
    const viewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]'
    );
    const previousBodyStyle = {
      height: body.style.height,
      minHeight: body.style.minHeight,
      overflowX: body.style.overflowX,
      overflowY: body.style.overflowY,
      overscrollBehaviorY: body.style.overscrollBehaviorY,
      background: body.style.background,
    };
    const previousRootStyle = {
      background: root.style.background,
      backgroundColor: root.style.backgroundColor,
    };
    const previousAppStyle = app
      ? {
          height: app.style.height,
          minHeight: app.style.minHeight,
        }
      : null;
    const previousViewportContent = viewportMeta?.content ?? null;

    root.style.background = "#ffffff";
    body.style.height = "auto";
    body.style.minHeight = "100%";
    body.style.overflowX = "hidden";
    body.style.overflowY = "auto";
    body.style.overscrollBehaviorY = "auto";
    body.style.background = "transparent";

    if (app) {
      app.style.height = "auto";
      app.style.minHeight = "100%";
    }

    if (viewportMeta && !viewportMeta.content.includes("viewport-fit=cover")) {
      viewportMeta.content = `${viewportMeta.content}, viewport-fit=cover`;
    }

    return () => {
      root.style.background = previousRootStyle.background;
      root.style.backgroundColor = previousRootStyle.backgroundColor;
      body.style.height = previousBodyStyle.height;
      body.style.minHeight = previousBodyStyle.minHeight;
      body.style.overflowX = previousBodyStyle.overflowX;
      body.style.overflowY = previousBodyStyle.overflowY;
      body.style.overscrollBehaviorY = previousBodyStyle.overscrollBehaviorY;
      body.style.background = previousBodyStyle.background;

      if (app && previousAppStyle) {
        app.style.height = previousAppStyle.height;
        app.style.minHeight = previousAppStyle.minHeight;
      }

      if (viewportMeta && previousViewportContent !== null) {
        viewportMeta.content = previousViewportContent;
      }
    };
  }, []);
}

export function AccountDeletionLayout({
  children,
  contentClassName = "flex w-full max-w-sm flex-1 flex-col justify-center gap-4",
}: AccountDeletionLayoutProps) {
  useAccountDeletionFavicon();
  useAccountDeletionViewport();

  return (
    <main
      className="account-deletion-viewport flex min-h-dvh min-h-screen flex-col items-center justify-center-safe overflow-y-auto bg-white px-6 py-8 text-[#333333] sm:px-6"
      style={{
        ...accountDeletionThemeStyle,
        background:
          "linear-gradient(to bottom, #ffffff 0%, #ffffff calc(100% - env(safe-area-inset-bottom, 0px)), transparent calc(100% - env(safe-area-inset-bottom, 0px)), transparent 100%)",
        paddingTop: "calc(2rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <section className={contentClassName}>
        <AccountDeletionBrand />
        {children}
      </section>
      <AccountDeletionFooter />
    </main>
  );
}
