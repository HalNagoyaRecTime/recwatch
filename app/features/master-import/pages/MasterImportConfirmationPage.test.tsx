import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { MasterImportSession } from "~/features/master-import/api";

const { commit, get } = vi.hoisted(() => ({
  commit: vi.fn(),
  get: vi.fn(),
}));

function buildSession(
  overrides: Partial<MasterImportSession> = {}
): MasterImportSession {
  return {
    importId: "import-1",
    type: "students",
    status: "validated",
    fileName: "students.csv",
    total: 1,
    successCount: 1,
    errorCount: 0,
    errors: [],
    excludedCount: 0,
    excluded: [],
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
    ...overrides,
  };
}

const existingStudentsSession = buildSession({
  total: 15,
  successCount: 12,
  excludedCount: 3,
  excluded: [
    {
      rowIndex: 1,
      studentIdNumber: "S001",
      displayName: "山田花子",
      reason: "student_already_registered",
    },
    {
      rowIndex: 2,
      studentIdNumber: "S002",
      displayName: "佐藤次郎",
      reason: "student_already_registered_inactive",
    },
    {
      rowIndex: 3,
      studentIdNumber: "S003",
      displayName: "鈴木三郎",
      reason: "student_account_deleted",
    },
  ],
});

get.mockResolvedValue(buildSession());

vi.mock("~/features/master-import/api", () => ({
  masterImportApi: { get, commit },
}));

import { MasterImportConfirmationPage } from "./MasterImportConfirmationPage";

function renderPage(importId = "import-1") {
  render(
    <MemoryRouter initialEntries={[`/students/import?importId=${importId}`]}>
      <MasterImportConfirmationPage />
    </MemoryRouter>
  );
}

describe("MasterImportConfirmationPage", () => {
  it("APIで検証済みのCSV内容を共通テーブルで表示し、除外する行が無ければ除外件数と一覧は出さない", async () => {
    renderPage();

    expect(
      await screen.findByRole("dialog", { name: "取り込み確認" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "取り込み内容" })
    ).toBeInTheDocument();
    expect(screen.getByText("S001")).toBeInTheDocument();
    expect(screen.queryByText("除外件数")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /除外する行/ })
    ).not.toBeInTheDocument();
  });

  it("登録前に件数・ファイル・データ種別・確認期限をモーダルで確認する", async () => {
    const user = userEvent.setup();
    commit.mockResolvedValueOnce(
      buildSession({
        status: "committed",
        rows: [],
        rowsTotal: 0,
        committedResult: { imported: 1, errorCount: 0, errors: [] },
      })
    );

    renderPage();

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
    get.mockResolvedValueOnce(
      buildSession({
        importId: "import-error",
        total: 2,
        successCount: 0,
        errorCount: 2,
        errors: [
          { rowIndex: 1, reason: "attendance_number_duplicate_in_db" },
          { rowIndex: 2, reason: "attendance_number_duplicate_in_db" },
        ],
        rows: [],
        rowsTotal: 0,
      })
    );

    renderPage("import-error");

    const dialog = await screen.findByRole("dialog", {
      name: "2件のエラーがあります",
    });
    expect(
      within(dialog).getByText(
        "2行目：同じクラスの出席番号が既に使われています"
      )
    ).toBeInTheDocument();

    expect(
      within(dialog).getByRole("link", { name: "戻る" })
    ).toBeInTheDocument();
  });

  it("既存学生を除外する行だけなら、登録件数・除外件数・除外する行と理由を見せて残りを登録できる", async () => {
    const user = userEvent.setup();
    get.mockResolvedValueOnce(existingStudentsSession);

    renderPage();

    const dialog = await screen.findByRole("dialog", {
      name: "取り込み確認",
    });
    expect(
      within(dialog).getByText("登録件数").closest("div")
    ).toHaveTextContent("登録件数12件");
    expect(
      within(dialog).getByText("除外件数").closest("div")
    ).toHaveTextContent("除外件数3件");
    const excludedRows = within(
      within(dialog).getByRole("region", { name: "除外する行（3件）" })
    ).getAllByRole("listitem");
    expect(excludedRows.map((row) => row.textContent)).toEqual([
      "2行目：S001 山田花子既に登録されています",
      "3行目：S002 佐藤次郎無効化された学生として登録されています 学生一覧で探す",
      "4行目：S003 鈴木三郎退会した学生のため登録しません",
    ]);
    expect(
      within(dialog).getAllByRole("link", { name: /学生一覧で探す/ })
    ).toHaveLength(1);
    expect(
      within(excludedRows[1]).getByRole("link", {
        name: "S002を学生一覧で探す",
      })
    ).toHaveAttribute("href", "/students?search=S002&isLiveActive=false");

    await user.click(
      within(dialog).getByRole("button", { name: "登録する（12件）" })
    );
    await waitFor(() => expect(commit).toHaveBeenCalledWith("import-1"));
  });

  it("除外する行のほかに修正が必要なエラーがあれば登録できない", async () => {
    get.mockResolvedValueOnce(
      buildSession({
        ...existingStudentsSession,
        successCount: 11,
        errorCount: 1,
        errors: [
          { rowIndex: 2, reason: "attendance_number_duplicate_in_file" },
        ],
      })
    );

    renderPage();

    const dialog = await screen.findByRole("dialog", {
      name: "1件のエラーがあります",
    });
    expect(
      within(dialog).getByRole("button", { name: "登録する（11件）" })
    ).toBeDisabled();
  });

  it("全行が除外される場合は登録できない", async () => {
    get.mockResolvedValueOnce(
      buildSession({
        successCount: 0,
        excludedCount: 1,
        excluded: [
          {
            rowIndex: 1,
            studentIdNumber: "S001",
            displayName: "山田花子",
            reason: "student_already_registered",
          },
        ],
      })
    );

    renderPage();

    const dialog = await screen.findByRole("dialog", {
      name: "取り込み確認",
    });
    expect(
      within(dialog).getByRole("button", { name: "登録する（0件）" })
    ).toBeDisabled();
  });

  it("登録後に、登録した件数と除外した件数を示す", async () => {
    get.mockResolvedValueOnce(
      buildSession({
        ...existingStudentsSession,
        status: "committed",
        committedResult: { imported: 12, errorCount: 0, errors: [] },
      })
    );

    renderPage();

    expect(
      await screen.findByText("12件を登録しました。3件は除外しました。")
    ).toBeInTheDocument();
  });
});
