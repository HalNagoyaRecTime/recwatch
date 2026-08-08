/**
 * The sidebar follows Tailwind's default `md` breakpoint. Keep the JavaScript
 * media query in one place so drawer behavior and CSS presentation do not
 * drift apart.
 */
export const SIDEBAR_MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export function getIsSidebarMobileViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(SIDEBAR_MOBILE_MEDIA_QUERY).matches
  );
}
