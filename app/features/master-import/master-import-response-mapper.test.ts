import { describe, expect, it } from "vitest";

import { toMasterImportSession } from "./master-import-response-mapper";

const validResponse = {
  validated_file_id: "import-123",
  type: "students",
  status: "validated",
  file_name: "students.csv",
  total: 1,
  success_count: 1,
  error_count: 0,
  errors: [],
  excluded_count: 0,
  excluded: [],
  rows: [{ student_id: "S001" }],
  rows_total: 1,
  rows_limit: 100,
  rows_offset: 0,
  created_at: "2026-08-21T00:00:00.000Z",
  expires_at: "2026-08-21T00:30:00.000Z",
  committed_result: null,
};

describe("toMasterImportSession", () => {
  it("APIのvalidated_file_idを画面用のimportIdへ正規化する", () => {
    expect(toMasterImportSession(validResponse)).toMatchObject({
      importId: "import-123",
      type: "students",
      status: "validated",
    });
  });

  it("取り込みIDが無いレスポンスを拒否する", () => {
    expect(() =>
      toMasterImportSession({ ...validResponse, validated_file_id: undefined })
    ).toThrow("取り込み結果の形式が不正です。");
  });

  it.each([
    "type",
    "status",
    "file_name",
    "total",
    "success_count",
    "error_count",
    "errors",
    "excluded_count",
    "excluded",
    "rows",
    "rows_total",
    "rows_limit",
    "rows_offset",
    "created_at",
    "expires_at",
  ] as const)("必須項目%sが無いレスポンスを拒否する", (field) => {
    expect(() =>
      toMasterImportSession({ ...validResponse, [field]: undefined })
    ).toThrow("取り込み結果の形式が不正です。");
  });

  it("エラー行を画面モデルへ変換しreason欠落時はunknownを使う", () => {
    const result = toMasterImportSession({
      ...validResponse,
      error_count: 2,
      errors: [
        { row_index: 3, reason: "学籍番号が重複しています", field: "id" },
        { row_index: 4, field: "name" },
      ],
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        rowIndex: 3,
        reason: "学籍番号が重複しています",
        field: "id",
      }),
      expect.objectContaining({
        rowIndex: 4,
        reason: "unknown",
        field: "name",
      }),
    ]);
  });

  it("除外する行を画面モデルへ変換する", () => {
    const result = toMasterImportSession({
      ...validResponse,
      total: 2,
      success_count: 1,
      excluded_count: 1,
      excluded: [
        {
          row_index: 1,
          class_code: "1A",
          attendance_number: 1,
          student_id_number: "S001",
          display_name: "山田花子",
          student_id: 7,
          user_id: 70,
          reason: "student_already_registered_inactive",
        },
      ],
    });

    expect(result).toMatchObject({
      successCount: 1,
      excludedCount: 1,
      excluded: [
        {
          rowIndex: 1,
          studentIdNumber: "S001",
          displayName: "山田花子",
          reason: "student_already_registered_inactive",
        },
      ],
    });
  });

  it("学籍番号が無い除外行を含むレスポンスを拒否する", () => {
    expect(() =>
      toMasterImportSession({
        ...validResponse,
        excluded_count: 1,
        excluded: [
          {
            row_index: 1,
            display_name: "山田花子",
            reason: "student_already_registered",
          },
        ],
      })
    ).toThrow("取り込み結果の形式が不正です。");
  });
});
