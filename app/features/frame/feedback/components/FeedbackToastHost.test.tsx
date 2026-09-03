import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "./FeedbackProvider";
import { FeedbackToastHost } from "./FeedbackToastHost";

function ReportButton() {
  const { report } = useFeedback();
  return (
    <button
      type="button"
      onClick={() =>
        report({
          kind: "action-success",
          title: "完了",
          message: "処理が完了しました",
        })
      }
    >
      report
    </button>
  );
}

describe("FeedbackToastHost", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pointer hover中は残り時間を保持してauto dismissを一時停止する", () => {
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackToastHost />
        <ReportButton />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "report" }));
    const toast = screen.getByRole("status");

    act(() => vi.advanceTimersByTime(2000));
    fireEvent.pointerEnter(toast);
    act(() => vi.advanceTimersByTime(5000));
    expect(toast).toBeInTheDocument();

    fireEvent.pointerLeave(toast);
    act(() => vi.advanceTimersByTime(1999));
    expect(toast).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    act(() => vi.advanceTimersByTime(220));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("Toast内部にfocusがある間もauto dismissを一時停止する", () => {
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackToastHost />
        <ReportButton />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "report" }));
    const toast = screen.getByRole("status");
    const collapse = screen.getByRole("button", { name: "通知を小さくする" });

    act(() => vi.advanceTimersByTime(2000));
    fireEvent.focus(collapse);
    act(() => vi.advanceTimersByTime(5000));
    expect(toast).toBeInTheDocument();

    fireEvent.blur(collapse, { relatedTarget: document.body });
    act(() => vi.advanceTimersByTime(2000));
    act(() => vi.advanceTimersByTime(220));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
