import type { ReactNode } from "react";

export function AccountDeletionErrorMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-10 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.12)] px-4 py-3 text-sm leading-5 text-[#dc2626]">
      {children}
    </div>
  );
}
