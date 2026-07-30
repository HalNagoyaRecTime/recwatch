import { describe, expect, it } from "vitest";

import { parseStudentImportFile } from "./parseStudentImportFile";

function csvFile(content: string, name = "students.csv") {
  return new File([content], name, { type: "text/csv" });
}

describe("parseStudentImportFile", () => {
  it("parses rows using the API's snake_case headers", async () => {
    const file = csvFile(
      "class_code,attendance_number,student_id_number,last_name,first_name\n" +
        "A,1,IA00A000,山田,花子\n" +
        "B,2,IA00A001,鈴木,一郎\n"
    );

    const result = await parseStudentImportFile(file);

    expect(result.formatErrors).toEqual([]);
    expect(result.rows).toEqual([
      {
        class_code: "A",
        attendance_number: 1,
        student_id_number: "IA00A000",
        last_name: "山田",
        first_name: "花子",
      },
      {
        class_code: "B",
        attendance_number: 2,
        student_id_number: "IA00A001",
        last_name: "鈴木",
        first_name: "一郎",
      },
    ]);
  });

  it("parses rows using Japanese headers", async () => {
    const file = csvFile(
      "クラス,出席番号,学籍番号,姓,名\nA,1,IA00A000,山田,花子\n"
    );

    const result = await parseStudentImportFile(file);

    expect(result.rows).toEqual([
      {
        class_code: "A",
        attendance_number: 1,
        student_id_number: "IA00A000",
        last_name: "山田",
        first_name: "花子",
      },
    ]);
  });

  it("skips blank rows", async () => {
    const file = csvFile(
      "class_code,attendance_number,student_id_number,last_name,first_name\n" +
        "A,1,IA00A000,山田,花子\n" +
        ",,,,\n"
    );

    const result = await parseStudentImportFile(file);

    expect(result.rows).toHaveLength(1);
  });

  it("collects format errors for rows with missing or invalid values", async () => {
    const file = csvFile(
      "class_code,attendance_number,student_id_number,last_name,first_name\n" +
        "A,1,IA00A000,山田,花子\n" +
        ",0,,鈴木,\n"
    );

    const result = await parseStudentImportFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.formatErrors).toEqual([
      {
        rowNumber: 3,
        message: "クラス、出席番号、学籍番号、名の値が不正です",
      },
    ]);
  });

  it("throws when a required column is missing", async () => {
    const file = csvFile(
      "attendance_number,student_id_number,last_name,first_name\n1,IA00A000,山田,花子\n"
    );

    await expect(parseStudentImportFile(file)).rejects.toThrow(
      "必須列が見つかりません: クラス"
    );
  });

  it("throws when there are no data rows", async () => {
    const file = csvFile(
      "class_code,attendance_number,student_id_number,last_name,first_name\n"
    );

    await expect(parseStudentImportFile(file)).rejects.toThrow(
      "有効なデータ行が見つかりません。"
    );
  });
});
