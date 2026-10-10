import type { ReactNode } from "react";

export function AccountDeletionErrorMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      role={children ? "alert" : undefined}
      aria-atomic="true"
      className={
        children
          ? "flex min-h-12 items-center justify-center rounded-sm bg-[#B51F32] p-4 text-center text-sm leading-5 font-normal wrap-anywhere text-white"
          : "min-h-12"
      }
    >
      {children}
    </div>
  );
}
