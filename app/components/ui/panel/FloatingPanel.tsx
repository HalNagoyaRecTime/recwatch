import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  FloatingPortal,
  useRole,
  useInteractions,
  useClick,
  safePolygon,
  FloatingNode,
  useFloatingNodeId,
  useFloatingTree,
  type Placement,
} from "@floating-ui/react";
import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "~/lib/cn";

export type FloatingPanelProps = {
  /** A single element that can receive refs and interaction props. */
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
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();

  const { refs, floatingStyles, context } = useFloating({
    nodeId,
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
  // Prevent dismiss events from bubbling through a nested floating tree.
  // This is important when a child panel is rendered in a portal.
  const dismiss = useDismiss(context, { bubbles: false });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss,
    role,
  ]);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(
        trigger,
        // eslint-disable-next-line react-hooks/refs
        getReferenceProps({
          // eslint-disable-next-line react-hooks/refs
          ref: refs.setReference,
          className: cn(
            (trigger.props as { className?: string }).className,
            triggerClassName
          ),
        })
      )
    : trigger;

  const panel = (
    <>
      {triggerElement}
      {isOpen && (
        <FloatingPortal>
          <div
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cn("z-140", className)}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );

  // FloatingTree is opt-in so standalone panels keep their existing behavior.
  // Account menus opt in because they contain a nested theme panel.
  return tree ? <FloatingNode id={nodeId}>{panel}</FloatingNode> : panel;
}
