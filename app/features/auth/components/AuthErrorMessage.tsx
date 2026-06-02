import type { ReactNode } from "react";

type AuthErrorMessageProps = {
  children: ReactNode;
};

export function AuthErrorMessage({ children }: AuthErrorMessageProps) {
  return (
    <div className="flex min-h-10 items-center justify-center rounded-lg border border-[color:var(--tone-red-border)] bg-[color:var(--tone-red-bg)] px-4 py-3 text-sm leading-5 text-[color:var(--tone-red-text)]">
      {children}
    </div>
  );
}
