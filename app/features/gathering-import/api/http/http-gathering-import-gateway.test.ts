import { beforeEach, describe, expect, it, vi } from "vitest";

const { postForm } = vi.hoisted(() => ({ postForm: vi.fn() }));
vi.mock("~/lib/api-client", () => ({ apiClient: { postForm } }));

import { httpGatheringImportGateway } from "~/features/gathering-import/api/http/http-gathering-import-gateway";

const response = {
  event_id: 12,
  lock_version: 3,
  total_rows: 2,
  imported_rows: 1,
  excluded_rows: 1,
  rounds: [
    {
      round: 1,
      start_time: "1000",
      gatherings: [
        {
          gathering_time: "09:45",
          gathering_spot: {
            gathering_spot_id: 1,
            gathering_spot_name: "体育館前",
          },
          members: [
            {
              row_number: 2,
              user_id: 5,
              class_code: "IH12A203",
              attendance_number: 1,
              user_name: "山田太郎",
            },
          ],
        },
      ],
    },
    { round: 2, start_time: null, gatherings: [] },
  ],
  errors: [
    {
      row_number: 3,
      code: "INVALID_STUDENT",
      message: "読み取れません",
      student: "名前なし",
    },
  ],
  warnings: [
    {
      row_number: 4,
      code: "NAME_MISMATCH",
      message: "登録されている氏名は「鈴木花子」です",
      student: "NHIH12A20302 鈴木花",
      registered_name: "鈴木花子",
    },
  ],
};

describe("httpGatheringImportGateway", () => {
  beforeEach(() => postForm.mockReset().mockResolvedValue(response));

  it("プレビューはファイルだけを送り、開始時刻を HH:mm にして返す", async () => {
    const file = new File(["x"], "gatherings.csv");

    const result = await httpGatheringImportGateway.preview(12, file);

    const [path, form] = postForm.mock.calls[0] as [string, FormData];
    expect(path).toBe("/api/v1/events/12/gathering-imports/preview");
    expect(form.get("file")).toBe(file);
    expect(form.has("lock_version")).toBe(false);
    expect(result).toEqual({
      lockVersion: 3,
      totalRows: 2,
      importedRows: 1,
      excludedRows: 1,
      rounds: [
        {
          round: 1,
          startTime: "10:00",
          gatherings: [
            {
              time: "09:45",
              spotName: "体育館前",
              members: [{ rowNumber: 2, userId: 5, name: "山田太郎" }],
            },
          ],
        },
        { round: 2, startTime: null, gatherings: [] },
      ],
      errors: [
        {
          rowNumber: 3,
          code: "INVALID_STUDENT",
          message: "読み取れません",
          student: "名前なし",
        },
      ],
      warnings: [
        {
          rowNumber: 4,
          student: "NHIH12A20302 鈴木花",
          registeredName: "鈴木花子",
        },
      ],
    });
  });

  it("確定はファイルと lock_version を送る", async () => {
    const file = new File(["x"], "gatherings.csv");

    await httpGatheringImportGateway.commit(12, file, 3);

    const [path, form] = postForm.mock.calls[0] as [string, FormData];
    expect(path).toBe("/api/v1/events/12/gathering-imports");
    expect(form.get("file")).toBe(file);
    expect(form.get("lock_version")).toBe("3");
  });
});
