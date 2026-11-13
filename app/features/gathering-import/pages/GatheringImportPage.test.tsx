import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { GatheringImportGateway } from "~/features/gathering-import/api/contracts/gathering-import-gateway";
import type { GatheringImportResult } from "~/features/gathering-import/model/gathering-import-result";
import { GatheringImportPage } from "~/features/gathering-import/pages/GatheringImportPage";
import type { EventDetailGateway } from "~/features/events/api/event-detail-gateway";
import type { EventDetail } from "~/features/events/model/event-detail";
import {
  EventDetailPage,
  type EventDetailOutletContext,
} from "~/features/events/pages/EventDetailPage";
import { ApiClientError } from "~/lib/api-client-error";

function buildResult(
  overrides: Partial<GatheringImportResult> = {}
): GatheringImportResult {
  return {
    lockVersion: 7,
    totalRows: 2,
    importedRows: 2,
    excludedRows: 0,
    rounds: [
      {
        round: 1,
        startTime: "10:00",
        gatherings: [
          {
            time: "09:45",
            spotName: "体育館前",
            members: [
              { rowNumber: 2, userId: 1, name: "山田太郎" },
              { rowNumber: 3, userId: 2, name: "鈴木花子" },
            ],
          },
        ],
      },
    ],
    errors: [],
    warnings: [],
    ...overrides,
  };
}

const withExcludedRow = buildResult({
  totalRows: 3,
  excludedRows: 1,
  errors: [
    {
      rowNumber: 4,
      code: "STUDENT_NOT_FOUND",
      message: "クラス記号 IH12A203・出席番号 9 の生徒は登録されていません",
      student: "NHIH12A20309 佐藤一郎",
    },
  ],
});

function renderPage(
  gateway: GatheringImportGateway,
  reload: () => void = vi.fn()
) {
  const context: EventDetailOutletContext = { event: null, reload };
  const file = new File(["ラウンド"], "gatherings.csv", { type: "text/csv" });
  render(
    <MemoryRouter initialEntries={["/events/12/gathering-import"]}>
      <Routes>
        <Route element={<Outlet context={context} />} path="/events/:eventId">
          <Route
            element={<GatheringImportPage gateway={gateway} />}
            path="gathering-import"
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  return {
    file,
    selectFile: () =>
      userEvent.upload(screen.getByLabelText("CSV ファイル"), file),
  };
}

describe("GatheringImportPage", () => {
  it("取り込まれない行があるときは、その行を見せ、確認するまで確定できない", async () => {
    const reload = vi.fn();
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(withExcludedRow),
      commit: vi.fn().mockResolvedValue(withExcludedRow),
    };
    const { file, selectFile } = renderPage(gateway, reload);

    await selectFile();

    const errorTab = await screen.findByRole("tab", { name: /エラー/ });
    expect(errorTab).toHaveTextContent("エラー1");
    await userEvent.click(errorTab);
    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent("4行目");
    expect(row).toHaveTextContent("佐藤一郎");
    expect(row).toHaveTextContent("NHIH12A20309");
    expect(row).toHaveTextContent("生徒が未登録");
    const commitButton = screen.getByRole("button", {
      name: "確定する（2人）",
    });
    expect(commitButton).toBeDisabled();
    expect(
      screen.getByText(/行の生徒は、確定すると、どの集合にも入りません/)
    ).toHaveTextContent(
      "エラーの 1行の生徒は、確定すると、どの集合にも入りません。"
    );

    await userEvent.click(screen.getByLabelText("1行を除いて取り込む"));
    await userEvent.click(commitButton);

    expect(gateway.commit).toHaveBeenCalledWith(12, file, 7);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "2人を集合に取り込みました。1行は取り込んでいません。"
    );
    expect(reload).toHaveBeenCalled();
  });

  it("取り込まれない行が無ければ、すぐに確定できる", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(buildResult()),
      commit: vi.fn().mockResolvedValue(buildResult()),
    };
    const { selectFile } = renderPage(gateway);

    await selectFile();

    expect(
      await screen.findByRole("button", { name: "確定する（2人）" })
    ).toBeEnabled();
    expect(
      screen.queryByRole("tab", { name: /エラー/ })
    ).not.toBeInTheDocument();
    const round = screen.getByRole("region", { name: "ラウンド 1" });
    expect(round).toHaveTextContent("開始 10:00");
    expect(round).toHaveTextContent("合計 2名");
    expect(round).toHaveTextContent("09:45体育館前2名");
  });

  it("確認中に集合が変更されていたら、同じファイルで確認し直す", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi
        .fn()
        .mockResolvedValueOnce(buildResult())
        .mockResolvedValueOnce(buildResult({ lockVersion: 8 })),
      commit: vi
        .fn()
        .mockRejectedValueOnce(
          new ApiClientError(409, "競技が他の操作で更新されています")
        )
        .mockResolvedValueOnce(buildResult()),
    };
    const { file, selectFile } = renderPage(gateway);
    await selectFile();

    await userEvent.click(
      await screen.findByRole("button", { name: "確定する（2人）" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "確認している間に、この競技の集合が変更されたため、最新の状態で確認し直しました。"
    );
    expect(gateway.preview).toHaveBeenNthCalledWith(2, 12, file);

    await userEvent.click(
      screen.getByRole("button", { name: "確定する（2人）" })
    );

    expect(gateway.commit).toHaveBeenLastCalledWith(12, file, 8);
  });

  it("確定している間は確定ボタンだけ表示を変え、ほかのボタンは押せなくする", async () => {
    let finishCommit: (result: GatheringImportResult) => void = () => {};
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(buildResult()),
      commit: vi.fn(
        () =>
          new Promise<GatheringImportResult>((resolve) => {
            finishCommit = resolve;
          })
      ),
    };
    const { selectFile } = renderPage(gateway);
    await selectFile();

    await userEvent.click(
      await screen.findByRole("button", { name: "確定する（2人）" })
    );

    expect(
      screen.getByRole("button", { name: "取り込み中..." })
    ).toBeDisabled();
    const reselectButton = screen.getByRole("button", {
      name: "別のファイルを選ぶ",
    });
    expect(reselectButton).toBeDisabled();
    expect(reselectButton.querySelector("svg")).toHaveClass("lucide-upload");
    finishCommit(buildResult());
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("別のファイルを選び直すと、取り込まれない行の確認をやり直させる", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(withExcludedRow),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);
    await selectFile();
    await userEvent.click(await screen.findByLabelText("1行を除いて取り込む"));

    await selectFile();

    await waitFor(() => expect(gateway.preview).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByLabelText("1行を除いて取り込む")
    ).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "確定する（2人）" })
    ).toBeDisabled();
  });

  it("エラーのタブを見ている間にエラーの無いファイルへ選び直すと、集合のタブに戻る", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi
        .fn()
        .mockResolvedValueOnce(withExcludedRow)
        .mockResolvedValueOnce(buildResult()),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);
    await selectFile();
    await userEvent.click(await screen.findByRole("tab", { name: /エラー/ }));

    await selectFile();

    await waitFor(() =>
      expect(
        screen.queryByRole("tab", { name: /エラー/ })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole("tab", { name: /集合/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(
      screen.getByRole("region", { name: "ラウンド 1" })
    ).toBeInTheDocument();
  });

  it("氏名が登録と違う行を警告として見せる", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(
        buildResult({
          warnings: [
            {
              rowNumber: 3,
              student: "NHIH12A20302 鈴木花",
              registeredName: "鈴木花子",
            },
          ],
        })
      ),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);

    await selectFile();

    const warningTab = await screen.findByRole("tab", { name: /警告/ });
    expect(warningTab).toHaveTextContent("警告1");
    await userEvent.click(warningTab);
    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent("3行目");
    expect(row).toHaveTextContent("鈴木花");
    expect(row).toHaveTextContent("登録は鈴木花子");
  });

  it("取り込める行が無ければ確定できない", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi
        .fn()
        .mockResolvedValue(
          buildResult({ importedRows: 0, excludedRows: 0, rounds: [] })
        ),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);

    await selectFile();

    expect(
      await screen.findByRole("button", { name: "確定する（0人）" })
    ).toBeDisabled();
    expect(screen.getByText("取り込める行がありません")).toBeInTheDocument();
  });

  it("全部の行がエラーのときは、取り込める行が無いことを見せる", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue({
        ...withExcludedRow,
        totalRows: 1,
        importedRows: 0,
        rounds: [],
      }),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);

    await selectFile();

    expect(
      await screen.findByText("取り込める行がありません")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("1行を除いて取り込む")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "確定する（0人）" })
    ).toBeDisabled();
  });

  it("ファイルを読み取れなかったときは、API の理由を見せる", async () => {
    const gateway: GatheringImportGateway = {
      preview: vi
        .fn()
        .mockRejectedValue(
          new ApiClientError(
            400,
            "CSVを読み取れません。UTF-8でないか、必要な列がありません"
          )
        ),
      commit: vi.fn(),
    };
    const { selectFile } = renderPage(gateway);

    await selectFile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "CSVを読み取れません。UTF-8でないか、必要な列がありません"
    );
  });
});

describe("イベント詳細から開いたとき", () => {
  it("確定すると、置き換わった集合が競技詳細画面に出る", async () => {
    const event: EventDetail = {
      id: 12,
      name: "〇人〇脚",
      venues: [],
      startTime: "10:00",
      endTime: "12:00",
      rules: null,
      rounds: [],
    };
    const detailGateway: EventDetailGateway = {
      load: vi
        .fn()
        .mockResolvedValueOnce(event)
        .mockResolvedValue({
          ...event,
          rounds: [
            {
              round: 1,
              startTime: "10:00",
              gatherings: [
                {
                  id: 1,
                  time: "09:45",
                  spot: { id: 1, name: "体育館前" },
                  memberCount: 2,
                },
              ],
            },
          ],
        }),
    };
    const importGateway: GatheringImportGateway = {
      preview: vi.fn().mockResolvedValue(buildResult()),
      commit: vi.fn().mockResolvedValue(buildResult()),
    };
    render(
      <MemoryRouter initialEntries={["/events/12/gathering-import"]}>
        <Routes>
          <Route
            element={<EventDetailPage gateway={detailGateway} />}
            path="/events/:eventId"
          >
            <Route
              element={<GatheringImportPage gateway={importGateway} />}
              path="gathering-import"
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    await screen.findByText("集合を取り込む（〇人〇脚）");
    await userEvent.upload(
      screen.getByLabelText("CSV ファイル"),
      new File(["x"], "gatherings.csv")
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "確定する（2人）" })
    );

    await waitFor(() => expect(detailGateway.load).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("体育館前")).toBeInTheDocument();
  });
});
