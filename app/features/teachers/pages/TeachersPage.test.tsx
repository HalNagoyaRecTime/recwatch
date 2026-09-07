import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import type { TeacherRow } from "~/features/teachers/model/teacher";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";

const teachers: TeacherRow[] = [
  {
    teacherId: 2,
    userId: 12,
    displayName: "山田 花子",
    isLiveActive: true,
    isStaff: false,
    classRooms: [{ classRoomId: 1, classCode: "1A", className: "1年A組" }],
  },
];

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

describe("TeachersPage", () => {
  it("新規登録ボタンから一覧条件を維持して遷移する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers?search=佐橋&page=2"]}>
        <TeachersPage limit={50} offset={50} teachers={teachers} total={100} />
        <LocationProbe />
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=佐橋&page=2"
    );
  });

  it("検索・ソートをURLへ反映し、状態変更操作をAPI待ちで無効化する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers"]}>
        <TeachersPage
          classRooms={[
            { classRoomId: 1, classCode: "1A", className: "1年A組" },
          ]}
          limit={50}
          offset={0}
          teachers={teachers}
          total={1}
        />
        <LocationProbe />
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button", { name: "ID" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=teacherId&sortOrder=asc"
      )
    );
    await user.click(screen.getByRole("button", { name: "山田 花子の操作" }));
    expect(
      screen.getByRole("button", { name: "教官を編集する" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "教官を無効化する（未接続）" })
    ).toBeDisabled();
  });

  it("staff・有効列のソートをAPIのsortByへ反映する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers"]}>
        <TeachersPage limit={50} offset={0} teachers={teachers} total={1} />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "staff" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=isStaff&sortOrder=asc"
      )
    );

    await user.click(screen.getByRole("button", { name: "staff" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=isStaff&sortOrder=desc"
      )
    );

    await user.click(screen.getByRole("button", { name: "有効" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=isLiveActive&sortOrder=asc"
      )
    );
  });
});
