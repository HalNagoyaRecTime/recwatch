import type { FloatingRootContext } from "@floating-ui/react";
import { createContext } from "react";

export const FloatingPanelContext = createContext<FloatingRootContext | null>(
  null
);
