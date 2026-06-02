import { useNavState } from "~/hooks/useNavState";

import { useLeftNavigationHoverState } from "~/features/frame/left-navigation/hooks/useLeftNavigationHoverState";

export function useLeftNavigationExpanded() {
  const isOpen = useNavState((state) => state.isOpen);
  const isHovering = useLeftNavigationHoverState((state) => state.isHovering);

  return isOpen || isHovering;
}
