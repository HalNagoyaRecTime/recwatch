import { useContext } from "react";

import { FeedbackContext } from "../components/FeedbackContext";

export function useFeedback() {
  return useContext(FeedbackContext);
}
