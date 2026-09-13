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
    email: "yamada@example.com",
    isLiveActive: true,
    isStaff: false,
    classRooms: [{ classRoomId: 1, classCode: "1A", className: "1年A組" }],
  },
];

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function getLocationParams() {
  return new URLSearchParams(
    screen.getByTestId("location-search").textContent ?? ""
  );
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: string,
  optionName: string
) {
  await user.click(screen.getByRole("combobox", { name: comboboxName }));
  await user.click(screen.getByRole("option", { name: optionName }));
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
      screen.getByRole("button", { name: "教官を無効化する" })
    ).toBeEnabled();
  });

  it("各filterをURLへ反映し、一覧を1ページ目へ戻す", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers?page=3"]}>
        <TeachersPage
          classRooms={[
            { classRoomId: 1, classCode: "1A", className: "1年A組" },
          ]}
          limit={50}
          offset={100}
          teachers={teachers}
          total={150}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    await selectOption(user, "担当クラスフィルター", "1A 1年A組");
    await waitFor(() => {
      expect(getLocationParams().get("classRoomId")).toBe("1");
      expect(getLocationParams().has("page")).toBe(false);
    });

    await selectOption(user, "staffフィルター", "staff:いいえ");
    await waitFor(() => {
      expect(getLocationParams().get("classRoomId")).toBe("1");
      expect(getLocationParams().get("isStaff")).toBe("false");
    });

    await selectOption(user, "有効状態フィルター", "有効:いいえ");
    await waitFor(() => {
      expect(getLocationParams().get("isLiveActive")).toBe("false");
      expect(getLocationParams().has("page")).toBe(false);
    });
  });

  it("filterをすべてへ戻すとURLを既定状態へ正規化する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          "/teachers?page=2&classRoomId=1&isStaff=false&isLiveActive=false",
        ]}
      >
        <TeachersPage
          classRooms={[
            { classRoomId: 1, classCode: "1A", className: "1年A組" },
          ]}
          limit={50}
          offset={50}
          teachers={teachers}
          total={100}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    await selectOption(user, "担当クラスフィルター", "クラス:すべて");
    await selectOption(user, "staffフィルター", "staff:すべて");
    await selectOption(user, "有効状態フィルター", "有効:すべて");

    await waitFor(() => {
      const params = getLocationParams();
      expect(params.has("page")).toBe(false);
      expect(params.has("classRoomId")).toBe(false);
      expect(params.has("isStaff")).toBe(false);
      expect(params.get("isLiveActive")).toBe("all");
    });
  });

  it("検索をdebounce後にURLへ反映し、一覧を1ページ目へ戻す", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers?page=3&isStaff=false"]}>
        <TeachersPage limit={50} offset={100} teachers={teachers} total={150} />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.type(
      screen.getByRole("searchbox", { name: "教官を検索" }),
      "佐橋"
    );

    await waitFor(
      () => {
        const params = getLocationParams();
        expect(params.get("search")).toBe("佐橋");
        expect(params.get("isStaff")).toBe("false");
        expect(params.has("page")).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it("paginationをURLへ反映する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers"]}>
        <TeachersPage limit={50} offset={0} teachers={teachers} total={100} />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "次のページ" }));

    await waitFor(() => expect(getLocationParams().get("page")).toBe("2"));
  });

  it("全sort列をAPIのsortByへ反映する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/teachers?page=2"]}>
        <TeachersPage limit={50} offset={50} teachers={teachers} total={100} />
        <LocationProbe />
      </MemoryRouter>
    );

    const sortCases = [
      ["ID", "teacherId"],
      ["教官名", "displayName"],
      ["staff", "isStaff"],
      ["有効", "isLiveActive"],
      ["クラスコード", "classCode"],
      ["クラス名", "className"],
    ] as const;

    for (const [label, sortBy] of sortCases) {
      await user.click(screen.getByRole("button", { name: label }));
      await waitFor(() => {
        const params = getLocationParams();
        expect(params.get("sortBy")).toBe(sortBy);
        expect(params.get("sortOrder")).toBe("asc");
        expect(params.has("page")).toBe(false);
      });
    }

    await user.click(screen.getByRole("button", { name: "クラス名" }));
    await waitFor(() => {
      expect(getLocationParams().get("sortBy")).toBe("className");
      expect(getLocationParams().get("sortOrder")).toBe("desc");
    });
  });
});
