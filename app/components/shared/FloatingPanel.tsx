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
import {
  useState,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from "react";
import { cn } from "~/lib/cn";

export type FloatingPanelProps = {
  trigger: ReactElement;
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
      {isValidElement(trigger)
        ? cloneElement(
            trigger,
            // eslint-disable-next-line react-hooks/refs
            getReferenceProps({
              // eslint-disable-next-line react-hooks/refs
              ref: refs.setReference,
              ...(trigger.props as Record<string, unknown>),
              className: cn(
                (trigger.props as { className?: string }).className,
                triggerClassName
              ),
            })
          )
        : trigger}
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
