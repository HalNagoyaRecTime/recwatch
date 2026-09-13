import type { ReactNode } from "react";

import { AccountDeletionBrand } from "~/features/account-deletion/components/AccountDeletionBrand";
import { AccountDeletionFooter } from "~/features/account-deletion/components/AccountDeletionFooter";

type AccountDeletionLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AccountDeletionLayout({
  children,
  contentClassName = "flex w-full max-w-xl flex-1 flex-col justify-center gap-5",
}: AccountDeletionLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center-safe overflow-visible px-4 py-8 sm:px-6 md:h-dvh md:overflow-x-hidden md:overflow-y-auto">
      <section className={contentClassName}>
        <AccountDeletionBrand />
        {children}
      </section>
      <AccountDeletionFooter />
    </main>
  );
}
