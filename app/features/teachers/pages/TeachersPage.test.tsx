import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { TeacherRow } from "~/features/teachers/model/teacher";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";

vi.mock("~/features/teachers/components/TeacherActionMenu", () => ({
  TeacherActionMenu: () => <button type="button">操作</button>,
}));

const teachers: TeacherRow[] = [
  {
    teacherId: 2,
    displayName: "山田 花子",
    isLiveActive: true,
    classRooms: [],
  },
];

function LocationProbe() {
  const location = useLocation();

  return (
    <>
      <output data-testid="location-pathname">{location.pathname}</output>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

describe("TeachersPage", () => {
  it("CSV取り込みの横に同じUIの新規登録ボタンを表示して登録画面へ遷移する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/teachers?search=佐橋&page=2"]}>
        <TeachersPage limit={50} offset={50} teachers={teachers} total={100} />
        <LocationProbe />
      </MemoryRouter>
    );

    const importButton = screen.getByRole("button", {
      name: "CSV / Excel を取り込む",
    });
    const individualButton = screen.getByRole("button", { name: "新規登録" });

    expect(importButton.parentElement).toBe(individualButton.parentElement);
    expect(importButton.className).toBe(individualButton.className);

    await user.click(individualButton);

    expect(screen.getByTestId("location-pathname")).toHaveTextContent(
      "/teachers/new"
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?search=佐橋&page=2"
    );
  });

  it("IDソートのクリックを一覧URLへ反映する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/teachers"]}>
        <TeachersPage limit={50} offset={0} teachers={teachers} total={1} />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "教官ID" }));
    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=teacherId&sortOrder=asc"
      );
    });

    await user.click(screen.getByRole("button", { name: "教官ID" }));
    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=teacherId&sortOrder=desc"
      );
    });
  });

  it("検索変更時に1ページ目へ戻る", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={["/teachers?page=3&sortBy=teacherId&sortOrder=desc"]}
      >
        <TeachersPage limit={50} offset={100} teachers={teachers} total={200} />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.type(
      screen.getByRole("searchbox", { name: "教官を検索" }),
      "佐橋"
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=teacherId&sortOrder=desc&search=%E4%BD%90%E6%A9%8B"
      );
      expect(screen.getByTestId("location-search")).not.toHaveTextContent(
        "page=3"
      );
    });
  });

  it("最終行削除後に存在する最終ページへ補正する", async () => {
    render(
      <MemoryRouter initialEntries={["/teachers?page=3"]}>
        <TeachersPage limit={50} offset={100} teachers={teachers} total={60} />
        <LocationProbe />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent("page=2");
    });
  });
});
