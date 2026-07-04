import { useNavState } from "~/hooks/useNavState";

import { useNavigationHoverState } from "~/features/frame/navigation/hooks/useNavigationHoverState";

export function useNavigationExpanded() {
  const { isOpen } = useNavState();
  const { isHovering } = useNavigationHoverState();

  return isOpen || isHovering;
}
