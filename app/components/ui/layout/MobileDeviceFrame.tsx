import type { ReactNode } from "react";
import { Signal, Wifi } from "lucide-react";

type MobileDeviceFrameProps = {
  children?: ReactNode;
  appearance?: "auto" | "light" | "dark";
  timeLabel?: string;
};

const appearanceStyles = {
  auto: {
    foreground: "text-neutral-900 dark:text-white",
    homeIndicator: "bg-neutral-900/80 dark:bg-white/90",
  },
  light: {
    foreground: "text-neutral-900",
    homeIndicator: "bg-neutral-900/80",
  },
  dark: {
    foreground: "text-white",
    homeIndicator: "bg-white/90",
  },
};

export function MobileDeviceFrame({
  children,
  appearance = "auto",
  timeLabel = "--:--",
}: MobileDeviceFrameProps) {
  const colors = appearanceStyles[appearance];
  return (
    <div className="@container w-full">
      <div className="border-border-strong bg-surface-base aspect-9/20 w-full overflow-hidden rounded-[4.37cqw] border-[1.94cqw]">
        <div className="bg-surface-base @container relative h-full overflow-hidden rounded-[2.43cqw]">
          {children}

          <div className="pointer-events-none absolute top-[5cqw] left-1/2 size-[6.25cqw] -translate-x-1/2 rounded-full bg-slate-950" />

          <div
            className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-[5cqw] pt-[4cqw] text-[3.5cqw] font-semibold ${colors.foreground}`}
          >
            <span>{timeLabel}</span>
            <div className="flex items-center gap-[1.5cqw]">
              <Signal aria-hidden="true" className="size-[4cqw]" />
              <Wifi aria-hidden="true" className="size-[4cqw]" />
              <span className="h-[2.5cqw] w-[5cqw] rounded-sm border border-current bg-current" />
            </div>
          </div>

          <span
            className={`pointer-events-none absolute bottom-[2cqw] left-1/2 h-[1cqw] w-[24cqw] -translate-x-1/2 rounded-full ${colors.homeIndicator}`}
          />
        </div>
      </div>
    </div>
  );
}
