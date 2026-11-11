import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

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
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => setShowLoading(true), 150);
    return () => {
      window.clearTimeout(timer);
      setShowLoading(false);
    };
  }, [isLoading]);

  return (
    <button
      {...props}
      aria-busy={isLoading}
      className={[
        "relative flex min-h-12 w-full cursor-pointer items-center justify-center rounded-sm bg-[#333333] px-5 py-2 text-sm leading-5 font-medium text-white",
        "focus-visible:ring-2 focus-visible:ring-[#333333] focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      type="button"
    >
      <span
        className={[
          "flex items-center justify-center gap-3",
          isLoading ? "opacity-25" : "",
        ].join(" ")}
      >
        <AccountDeletionMicrosoftLogo />
        <span>{children}</span>
      </span>
      {isLoading && showLoading ? (
        <svg
          aria-hidden="true"
          className="absolute size-6 animate-spin"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M12 1a11 11 0 1 1-11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ) : null}
    </button>
  );
}
