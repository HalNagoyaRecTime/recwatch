import type { ReactNode } from "react";

type NavAccordionProps = {
  isOpen: boolean;
  children: ReactNode;
};

export function NavAccordion({ isOpen, children }: NavAccordionProps) {
  return (
    <div
      className="ml-[17.5px] overflow-hidden border-l border-[color:var(--border-1)] pl-[7.5px] transition-[max-height] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ maxHeight: isOpen ? 400 : 0 }}
    >
      {children}
    </div>
  );
}
