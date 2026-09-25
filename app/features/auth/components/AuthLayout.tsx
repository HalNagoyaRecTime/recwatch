import type { CSSProperties, ReactNode } from "react";

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
    <main
      className="box-border flex min-h-dvh min-h-screen flex-col items-center justify-center"
      style={authLayoutStyle}
    >
      <section className={contentClassName}>
        <AuthBrand />
        {children}
      </section>
      <AuthFooter />
    </main>
  );
}

const authLayoutStyle = {
  paddingTop: "calc(2.5rem + env(safe-area-inset-top, 0px))",
  paddingRight: "calc(1.5rem + env(safe-area-inset-right, 0px))",
  paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
  paddingLeft: "calc(1.5rem + env(safe-area-inset-left, 0px))",
} satisfies CSSProperties;
