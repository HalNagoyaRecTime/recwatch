import { useNavState } from "~/hooks/useNavState";

import { useLeftNavigationHoverState } from "~/features/frame/left-navigation/hooks/useLeftNavigationHoverState";

export function useLeftNavigationExpanded() {
  const { isOpen } = useNavState();
  const { isHovering } = useLeftNavigationHoverState();

  return isOpen || isHovering;
}
