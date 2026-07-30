import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";

const classRooms: ClassRoomData[] = [
  {
    classRoomId: 1,
    classRoomCode: "IH12A203",
    classRoomName: "情報処理学科1年A組",
    studentCount: 32,
    teacherName: "佐橋 晴斗",
  },
  {
    classRoomId: 2,
    classRoomCode: "PI12A203",
    classRoomName: "高度情報学科1年A組",
    studentCount: 25,
    teacherName: null,
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
  it("クラス一覧を表示し、担任未設定を区別する", () => {
    renderPage();

    expect(screen.getByText("IH12A203")).toBeInTheDocument();
    expect(screen.getByText("佐橋 晴斗")).toBeInTheDocument();
    expect(screen.getByText("32名")).toBeInTheDocument();
    expect(screen.getByText("未設定")).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "操作" })
    ).not.toBeInTheDocument();
  });

  it("クラス記号・クラス名・教官名で一覧を絞り込む", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchbox = screen.getByRole("searchbox", {
      name: "クラスを検索",
    });
    await user.type(searchbox, "佐橋");

    expect(screen.getByText("IH12A203")).toBeInTheDocument();
    expect(screen.queryByText("PI12A203")).not.toBeInTheDocument();

    await user.clear(searchbox);
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

    expect(
      screen.getByText("該当するクラスが見つかりません。")
    ).toBeInTheDocument();
  });
});
