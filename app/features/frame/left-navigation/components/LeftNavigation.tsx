import { LeftNavigationHeader } from "~/features/frame/left-navigation/components/LeftNavigationHeader";
import { NavigationContent } from "~/features/frame/left-navigation/components/NavigationContent";

export function LeftNavigation() {
  return (
    <div>
      <LeftNavigationHeader />
      <NavigationContent />
    </div>
  );
}
