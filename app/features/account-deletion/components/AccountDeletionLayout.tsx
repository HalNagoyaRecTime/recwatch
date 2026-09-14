import type { ReactNode } from "react";

import { AuthBrand } from "~/features/auth/components/AuthBrand";
import { AuthFooter } from "~/features/auth/components/AuthFooter";

type AccountDeletionLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AccountDeletionLayout({
  children,
  contentClassName = "flex w-full max-w-xl flex-1 flex-col justify-center gap-5",
}: AccountDeletionLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center-safe overflow-y-auto px-4 py-8 sm:px-6">
      <section className={contentClassName}>
        <AuthBrand />
        {children}
      </section>
      <AuthFooter />
    </main>
  );
}
