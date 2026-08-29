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
      className={`text-text-base app-rounded flex h-12 w-full cursor-pointer items-center justify-center bg-[linear-gradient(135deg,var(--button-brand-gradient-start),var(--button-brand-gradient-end))] px-4 text-sm font-black shadow-sm transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-(--brand-primary)/40 focus-visible:outline-none ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
