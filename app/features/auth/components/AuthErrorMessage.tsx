import type { ReactNode } from "react";

type AuthErrorMessageProps = {
  children: ReactNode;
};

export function AuthErrorMessage({ children }: AuthErrorMessageProps) {
  return (
    <div className="border-tone-danger-border bg-tone-danger-bg text-tone-danger-text flex min-h-10 items-center justify-center rounded-lg border px-4 py-3 text-sm leading-5">
      {children}
    </div>
  );
}
