import { LeftNavigationHeader } from "~/features/layout/left-navigation/components/LeftNavigationHeader";
import { NavigationContent } from "~/features/layout/left-navigation/components/NavigationContent";

export function LeftNavigation() {
  return (
    <div>
      <LeftNavigationHeader />
      <NavigationContent />
    </div>
  );
}
