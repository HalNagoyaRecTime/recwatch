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

export function AccountDeletionLayout({
  children,
  contentClassName = "flex w-full max-w-md flex-1 flex-col justify-center gap-4",
}: AccountDeletionLayoutProps) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center-safe overflow-y-auto bg-white px-6 py-8 text-[#333333] sm:px-6"
      style={accountDeletionThemeStyle}
    >
      <section className={contentClassName}>
        <AccountDeletionBrand />
        {children}
      </section>
      <AccountDeletionFooter />
    </main>
  );
}
