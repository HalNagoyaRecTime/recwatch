import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import type { TeacherRow } from "~/features/teachers/model/teacher";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";

const teachers: TeacherRow[] = [
  {
    teacherId: 2,
    teacherCode: "NH-STAFF02",
    displayName: "山田 花子",
    isLiveActive: true,
    classRooms: [],
  },
];

function LocationProbe() {
  return <output data-testid="location-search">{useLocation().search}</output>;
}

describe("TeachersPage", () => {
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
});
