import type { ReactNode } from "react";

import { AuthFooter } from "~/features/auth/components/AuthFooter";

type AccountDeletionLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AccountDeletionLayout({
  children,
  contentClassName = "w-full max-w-sm flex-1 flex flex-col justify-center",
}: AccountDeletionLayoutProps) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center-safe overflow-y-auto px-6 pt-10">
      <section className={contentClassName}>{children}</section>
      <AuthFooter />
    </main>
  );
}
