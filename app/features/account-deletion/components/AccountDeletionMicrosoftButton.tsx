import type { ButtonHTMLAttributes, ReactNode } from "react";

function AccountDeletionMicrosoftLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-4.5 w-4.5"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="8.145" width="8.145" fill="#F25022" />
      <rect height="8.145" width="8.145" x="9.855" fill="#7FBA00" />
      <rect height="8.145" width="8.145" y="9.855" fill="#00A4EF" />
      <rect height="8.145" width="8.145" x="9.855" y="9.855" fill="#FFB900" />
    </svg>
  );
}

interface AccountDeletionMicrosoftButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export function AccountDeletionMicrosoftButton({
  children,
  className,
  disabled = false,
  isLoading = false,
  ...props
}: AccountDeletionMicrosoftButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      className={[
        "app-rounded flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-[#333333] text-sm font-medium text-white transition-opacity",
        "hover:bg-[#333333]/90 focus-visible:ring-2 focus-visible:ring-[#333333] focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      // style={{ borderRadius: "4px" }}
      type="button"
    >
      <AccountDeletionMicrosoftLogo />
      <span>{children}</span>
    </button>
  );
}
