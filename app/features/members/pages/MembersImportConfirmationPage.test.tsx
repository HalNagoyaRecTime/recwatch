import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

const { commit, get } = vi.hoisted(() => ({
  commit: vi.fn(),
  get: vi.fn(),
}));

get.mockResolvedValue({
  importId: "import-1",
  type: "students",
  status: "validated",
  fileName: "students.csv",
  total: 1,
  successCount: 1,
  errorCount: 0,
  errors: [],
  rows: [
    {
      class_code: "1A",
      attendance_number: 1,
      student_id_number: "S001",
      last_name: "山田",
      first_name: "花子",
    },
  ],
  rowsTotal: 1,
  rowsLimit: 25,
  rowsOffset: 0,
  createdAt: "2026-01-01T00:00:00Z",
  expiresAt: "2026-01-02T00:00:00Z",
  committedResult: null,
});

vi.mock("~/features/master-import/api", () => ({
  masterImportApi: { get, commit },
}));

import { MembersImportConfirmationPage } from "./MembersImportConfirmationPage";

describe("MembersImportConfirmationPage", () => {
  it("APIで検証済みのCSV内容を共通テーブルで表示する", async () => {
    render(
      <MemoryRouter initialEntries={["/members/import?importId=import-1"]}>
        <MembersImportConfirmationPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("dialog", { name: "取り込み確認" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "取り込み内容" })
    ).toBeInTheDocument();
    expect(screen.getByText("S001")).toBeInTheDocument();
  });

  it("登録前に件数・ファイル・データ種別・確認期限をモーダルで確認する", async () => {
    const user = userEvent.setup();
    commit.mockResolvedValueOnce({
      importId: "import-1",
      type: "students",
      status: "committed",
      fileName: "students.csv",
      total: 1,
      successCount: 1,
      errorCount: 0,
      errors: [],
      rows: [],
      rowsTotal: 0,
      rowsLimit: 25,
      rowsOffset: 0,
      createdAt: "2026-01-01T00:00:00Z",
      expiresAt: "2026-01-02T00:00:00Z",
      committedResult: { imported: 1, errorCount: 0, errors: [] },
    });

    render(
      <MemoryRouter initialEntries={["/members/import?importId=import-1"]}>
        <MembersImportConfirmationPage />
      </MemoryRouter>
    );

    const dialog = await screen.findByRole("dialog", {
      name: "取り込み確認",
    });
    const registrationButton = within(dialog).getByRole("button", {
      name: "登録する（1件）",
    });
    expect(within(dialog).getByText("students.csv")).toBeInTheDocument();
    expect(within(dialog).getByText("学生")).toBeInTheDocument();
    expect(within(dialog).getByText("確認期限")).toBeInTheDocument();
    expect(
      within(dialog).getByText("2026年1月2日 09:00まで")
    ).toBeInTheDocument();
    expect(commit).not.toHaveBeenCalled();

    await user.click(registrationButton);
    await waitFor(() => expect(commit).toHaveBeenCalledWith("import-1"));
  });

  it("CSVの検証エラーをモーダルで表示し、閉じた後も再確認できる", async () => {
    get.mockResolvedValueOnce({
      importId: "import-error",
      type: "students",
      status: "validated",
      fileName: "students.csv",
      total: 2,
      successCount: 0,
      errorCount: 2,
      errors: [
        { rowIndex: 1, reason: "student_id_number_duplicate_in_db" },
        { rowIndex: 2, reason: "student_id_number_duplicate_in_db" },
      ],
      rows: [],
      rowsTotal: 0,
      rowsLimit: 25,
      rowsOffset: 0,
      createdAt: "2026-01-01T00:00:00Z",
      expiresAt: "2026-01-02T00:00:00Z",
      committedResult: null,
    });

    render(
      <MemoryRouter initialEntries={["/members/import?importId=import-error"]}>
        <MembersImportConfirmationPage />
      </MemoryRouter>
    );

    const dialog = await screen.findByRole("dialog", {
      name: "2件のエラーがあります",
    });
    expect(
      within(dialog).getByText("2行目：学籍番号が既に登録されています")
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("link", { name: "戻る" })
    ).toBeInTheDocument();
  });
});
