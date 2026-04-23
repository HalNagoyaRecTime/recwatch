import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function AuthPrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-[color:var(--tone-blue-border)] bg-[linear-gradient(135deg,var(--brand-button-1),var(--brand-button-2))] px-4 text-sm font-black text-[color:var(--brand-button-text)] shadow-[var(--shadow-soft)] transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--brand-1)]/40 focus-visible:outline-none ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
