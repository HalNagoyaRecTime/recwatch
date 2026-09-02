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
  useMergeRefs,
  type Placement,
  type Middleware,
  type OpenChangeReason,
} from "@floating-ui/react";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type HTMLProps,
  type Ref,
  type ReactNode,
} from "react";
import { cn } from "~/lib/cn";
import { FloatingPanelContext } from "~/components/ui/panel/FloatingPanelContext";

export type FloatingPanelProps = {
  /** refとインタラクション属性を受け取れる単一の要素です。 */
  trigger: ReactElement;
  content: ReactNode;
  placement?: Placement;
  interaction?: "click" | "hover" | "both";
  offsetValue?: number;
  /** 親パネルの外周との重なりを可能な範囲で防ぎます。 */
  avoidParentOverlap?: boolean;
  /** フォーカス管理時に最初にフォーカスする位置です。 */
  initialFocus?: number;
  /** flip後を含む実際の配置を通知します。 */
  onPlacementChange?: (placement: Placement) => void;
  /** ビューポートを超える内容をパネル内でスクロールさせます。 */
  scrollable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    event?: Event,
    reason?: OpenChangeReason
  ) => void;
  className?: string;
  triggerClassName?: string;
};

/**
 * 親パネルの外周と子パネルが重ならないように補正します。
 *
 * offset() の function form でも親パネルの実測値は取得できますが、
 * reference の祖先を参照する独自処理が必要です。また、offset() は
 * shift() より前に実行されるため、viewport補正後の再重なりを防げません。
 * そのため標準 middleware の後段で実測値を補正します。
 */
function createAvoidParentOverlapMiddleware(offsetValue: number): Middleware {
  return {
    name: "avoidParentOverlap",
    fn({ x, placement, rects, elements }) {
      const parentPanel =
        elements.reference instanceof HTMLElement
          ? elements.reference.closest<HTMLElement>("[data-floating-panel]")
          : null;
      if (parentPanel === null) {
        return {};
      }

      const parentRect = parentPanel.getBoundingClientRect();
      const side = placement.split("-")[0];

      if (side === "left") {
        const maximumRight = parentRect.left - offsetValue;
        return x + rects.floating.width > maximumRight
          ? { x: maximumRight - rects.floating.width }
          : {};
      }

      if (side === "right") {
        const minimumLeft = parentRect.right + offsetValue;
        return x < minimumLeft ? { x: minimumLeft } : {};
      }

      return {};
    },
  };
}

export function FloatingPanel({
  trigger,
  content,
  placement = "bottom",
  interaction = "click",
  offsetValue = 6,
  avoidParentOverlap = false,
  initialFocus = -1,
  onPlacementChange,
  scrollable = false,
  isOpen: controlledIsOpen,
  onOpenChange: setControlledIsOpen,
  className,
  triggerClassName,
}: FloatingPanelProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const handleOpenChange = (
    open: boolean,
    event?: Event,
    reason?: OpenChangeReason
  ) => {
    if (setControlledIsOpen) {
      setControlledIsOpen(open, event, reason);
    } else {
      setUncontrolledIsOpen(open);
    }
  };
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();

  const {
    refs,
    floatingStyles,
    context,
    placement: resolvedPlacement,
  } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetValue),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({
        padding: 8,
      }),
      avoidParentOverlap
        ? createAvoidParentOverlapMiddleware(offsetValue)
        : null,
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements }) {
          // 位置決めwrapperはscrollportにせず、surfaceへ利用可能サイズを渡します。
          if (scrollable) {
            elements.floating.style.setProperty(
              "--floating-panel-available-height",
              `${Math.max(0, availableHeight)}px`
            );
            elements.floating.style.setProperty(
              "--floating-panel-available-width",
              `${Math.max(0, availableWidth)}px`
            );
          } else {
            elements.floating.style.removeProperty(
              "--floating-panel-available-height"
            );
            elements.floating.style.removeProperty(
              "--floating-panel-available-width"
            );
          }
        },
      }),
    ],
  });

  useEffect(() => {
    onPlacementChange?.(resolvedPlacement);
  }, [onPlacementChange, resolvedPlacement]);

  const hoverEnabled = interaction !== "click";
  const clickEnabled = interaction !== "hover";
  const hover = useHover(context, {
    enabled: hoverEnabled,
    mouseOnly: interaction === "both",
    handleClose: safePolygon(),
  });
  const click = useClick(context, {
    enabled: clickEnabled,
    // bothではhover中のmouse clickで閉じず、touch/pen tapをclickへ通します。
    ignoreMouse: false,
    toggle: interaction !== "both",
  });
  // クリック・タッチ・キーボードを組み合わせるパネルではフォーカスを管理します。
  const focus = useFocus(context, { enabled: hoverEnabled });
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

  // useMergeRefsの配列評価でreact-hooks/refsが報告されるため、この行のみ抑制する
  // eslint-disable-next-line react-hooks/refs
  const mergedTriggerRef = useMergeRefs([
    // Floating UIのreference callback refをtriggerへ接続・合成するため
    // eslint-disable-next-line react-hooks/refs
    refs.setReference,
    // triggerが元から保持しているrefを失わずFloating UIのrefと合成するため
    (trigger.props as { ref?: Ref<HTMLElement> }).ref,
  ]);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(
        trigger,
        getReferenceProps({
          ...(trigger.props as HTMLProps<HTMLElement>),
          ref: mergedTriggerRef,
          className: cn(
            (trigger.props as { className?: string }).className,
            triggerClassName
          ),
        })
      )
    : trigger;

  const shouldManageFocus = interaction !== "hover";

  const floatingElement = (
    <div
      // Floating UIが提供するfloating callback refをpositioning elementへ接続するため、この行のみrefs ruleを抑制する
      // eslint-disable-next-line react-hooks/refs
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      data-floating-panel
      className={cn("app-rounded z-140", className)}
    >
      <FloatingPanelContext.Provider value={{ context, scrollable }}>
        {content}
      </FloatingPanelContext.Provider>
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
              initialFocus={initialFocus}
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
