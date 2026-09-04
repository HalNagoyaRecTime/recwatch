import { appConfig } from "~/config/app";

export function createPageTitle(pageTitle: string) {
  return `${pageTitle} | ${appConfig.appName}`;
}
