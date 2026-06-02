import type { ReactNode } from "react";

import { AuthBrand } from "~/features/auth/components/AuthBrand";
import { AuthFooter } from "~/features/auth/components/AuthFooter";

type AuthLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AuthLayout({
  children,
  contentClassName = "w-full max-w-sm flex-1 flex flex-col justify-center",
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pt-10">
      <section className={contentClassName}>
        <AuthBrand />
        {children}
      </section>
      <AuthFooter />
    </main>
  );
}
