import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "~/components/ui/form/SearchField";

describe("SearchField", () => {
  it("IME変換中は値を通知せず、変換確定後に一度だけ通知する", () => {
    const onValueChange = vi.fn();
    render(
      <SearchField ariaLabel="検索" onValueChange={onValueChange} value="" />
    );

    const input = screen.getByRole("searchbox", { name: "検索" });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "あ" } });

    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("あ");

    fireEvent.change(input, { target: { value: "あ" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
  });

  it("通常入力は変更ごとに通知する", () => {
    const onValueChange = vi.fn();
    render(
      <SearchField ariaLabel="検索" onValueChange={onValueChange} value="" />
    );

    const input = screen.getByRole("searchbox", { name: "検索" });
    fireEvent.change(input, { target: { value: "a" } });

    expect(onValueChange).toHaveBeenCalledWith("a");
  });
});
