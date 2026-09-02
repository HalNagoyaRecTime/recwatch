import type { FloatingRootContext } from "@floating-ui/react";
import { createContext } from "react";

export type FloatingPanelContextValue = {
  context: FloatingRootContext;
  scrollable: boolean;
};

export const FloatingPanelContext =
  createContext<FloatingPanelContextValue | null>(null);
