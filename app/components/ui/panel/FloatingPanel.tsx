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
  FloatingFocusManager,
  size,
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
  /** refとインタラクション属性を受け取れる単一の要素です。 */
  trigger: ReactElement;
  content: ReactNode;
  placement?: Placement;
  interaction?: "click" | "hover";
  offsetValue?: number;
  /** クリックで開くパネルのフォーカス管理。ホバー時は常に無効です。 */
  focusManagement?: "none" | "non-modal";
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
  focusManagement = "non-modal",
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
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(0, availableHeight)}px`,
            maxWidth: `${Math.max(0, availableWidth)}px`,
            overflow: "auto",
          });
        },
      }),
    ],
  });

  const hover = useHover(context, {
    enabled: interaction === "hover",
    handleClose: safePolygon(),
  });
  const click = useClick(context, { enabled: interaction === "click" });
  // クリックメニューはネストしたPortalへフォーカスが移っても閉じません。
  // ホバーパネルはキーボード操作のためフォーカス対応を維持します。
  const focus = useFocus(context, { enabled: interaction === "hover" });
  // ネストしたFloatingTreeへdismissイベントが伝播するのを防ぎます。
  // 子パネルをPortalへ描画する場合に必要です。
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

  const shouldManageFocus =
    interaction === "click" && focusManagement === "non-modal";

  const floatingElement = (
    <div
      // eslint-disable-next-line react-hooks/refs
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className={cn("z-140", className)}
    >
      {content}
    </div>
  );

  const panel = (
    <>
      {triggerElement}
      {isOpen && (
        <FloatingPortal>
          {shouldManageFocus ? (
            <FloatingFocusManager
              context={context}
              initialFocus={-1}
              modal={false}
              returnFocus
            >
              {floatingElement}
            </FloatingFocusManager>
          ) : (
            floatingElement
          )}
        </FloatingPortal>
      )}
    </>
  );

  // FloatingTreeはオプトインで、単独パネルは従来の挙動を維持します。
  // アカウントメニューはテーマパネルをネストするためオプトインします。
  return tree ? <FloatingNode id={nodeId}>{panel}</FloatingNode> : panel;
}
