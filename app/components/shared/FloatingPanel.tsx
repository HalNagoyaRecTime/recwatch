import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useClick,
  safePolygon,
  type Placement,
} from "@floating-ui/react";
import { useState, type ReactNode } from "react";
import { cn } from "~/lib/cn";

export type FloatingPanelProps = {
  trigger: ReactNode;
  content: ReactNode;
  placement?: Placement;
  interaction?: "click" | "hover";
  offsetValue?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerClassName?: string;
};

export function FloatingPanel({
  trigger,
  content,
  placement = "bottom",
  interaction = "click",
  offsetValue = 6,
  isOpen: controlledIsOpen,
  onOpenChange: setControlledIsOpen,
  className,
  triggerClassName,
}: FloatingPanelProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetValue),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, {
    enabled: interaction === "hover",
    handleClose: safePolygon(),
  });
  const click = useClick(context, { enabled: interaction === "click" });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={cn("inline-block", triggerClassName)}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={cn("z-140", className)}
        >
          {content}
        </div>
      )}
    </>
  );
}
