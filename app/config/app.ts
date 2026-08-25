export const appConfig = {
  appName: "recwatch",
} as const;

export function createPageTitle(pageTitle: string) {
  return `${pageTitle} | ${appConfig.appName}`;
}
