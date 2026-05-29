import type { SVGProps } from "react";

type MicrosoftLogoProps = SVGProps<SVGSVGElement>;

export function MicrosoftLogo({
  className = "h-4.5 w-4.5",
  ...props
}: MicrosoftLogoProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 21 21"
      className={className}
      fill="none"
      {...props}
    >
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
