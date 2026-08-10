import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { classRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";

const classRooms: classRoomData[] = [
  {
    ClassRoomId: 1,
    ClassRoomCode: "IH12A203",
    ClassRoomName: "情報処理学科1年A組",
    StudentCount: 32,
  },
  {
    ClassRoomId: 2,
    ClassRoomCode: "PI12A203",
    ClassRoomName: "高度情報学科1年A組",
    StudentCount: 25,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ClassRoomPage classRooms={classRooms} />
    </MemoryRouter>
  );
}

describe("ClassRoomPage", () => {
  it("クラス一覧を表示する", () => {
    renderPage();

    expect(screen.getByText("IH12A203")).toBeInTheDocument();
    expect(screen.getByText("32名")).toBeInTheDocument();
    expect(screen.getByText("情報処理学科1年A組")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "操作" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "情報処理学科1年A組を編集",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "高度情報学科1年A組を編集",
      })
    ).toBeInTheDocument();
  });

  it("クラス名で一覧を絞り込む", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchbox = screen.getByRole("searchbox", {
      name: "クラスを検索",
    });
    await user.type(searchbox, "高度情報");

    expect(screen.getByText("PI12A203")).toBeInTheDocument();
    expect(screen.queryByText("IH12A203")).not.toBeInTheDocument();
  });

  it("該当するクラスがない場合は空状態を表示する", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("searchbox", { name: "クラスを検索" }),
      "存在しないクラス"
    );

    expect(screen.getByText("クラスが見つかりません")).toBeInTheDocument();
  });
});
