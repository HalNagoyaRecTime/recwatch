import { createContext } from "react";

import type { FeedbackContextValue } from "../model/app-notification";

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);
