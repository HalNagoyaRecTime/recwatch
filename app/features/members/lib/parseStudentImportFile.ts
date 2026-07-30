import * as XLSX from "xlsx";

import type { StudentImportRow } from "../api";

const REQUIRED_FIELDS = [
  "class_code",
  "attendance_number",
  "student_id_number",
  "last_name",
  "first_name",
] as const;

type Field = (typeof REQUIRED_FIELDS)[number];

const FIELD_LABELS: Record<Field, string> = {
  class_code: "クラス",
  attendance_number: "出席番号",
  student_id_number: "学籍番号",
  last_name: "姓",
  first_name: "名",
};

// Accept either the API's snake_case field names or common Japanese headings,
// since import files are prepared manually by school staff.
const FIELD_ALIASES: Record<Field, string[]> = {
  class_code: ["class_code", "クラスコード", "クラス"],
  attendance_number: ["attendance_number", "出席番号"],
  student_id_number: ["student_id_number", "学籍番号"],
  last_name: ["last_name", "姓", "苗字"],
  first_name: ["first_name", "名"],
};

export type StudentImportFormatError = {
  rowNumber: number;
  message: string;
};

export type ParsedStudentImportFile = {
  rows: StudentImportRow[];
  formatErrors: StudentImportFormatError[];
};

// Passed as router state from MembersPage to MembersImportConfirmationPage.
export type StudentImportNavigationState = ParsedStudentImportFile & {
  fileName: string;
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

async function readAsTable(file: File): Promise<unknown[][]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: "string" })
    : XLSX.read(await file.arrayBuffer(), { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("シートが見つかりません。");
  }

  return XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    blankrows: false,
  });
}

export async function parseStudentImportFile(
  file: File
): Promise<ParsedStudentImportFile> {
  const table = await readAsTable(file);
  const [headerRow, ...dataRows] = table;

  if (!headerRow || headerRow.length === 0) {
    throw new Error("ヘッダー行が見つかりません。");
  }

  const columnIndexByField = {} as Record<Field, number>;
  const missingLabels: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const aliases = FIELD_ALIASES[field].map(normalizeHeader);
    const index = headerRow.findIndex((cell) =>
      aliases.includes(normalizeHeader(cell))
    );
    if (index === -1) {
      missingLabels.push(FIELD_LABELS[field]);
    } else {
      columnIndexByField[field] = index;
    }
  }

  if (missingLabels.length > 0) {
    throw new Error(`必須列が見つかりません: ${missingLabels.join("、")}`);
  }

  const rows: StudentImportRow[] = [];
  const formatErrors: StudentImportFormatError[] = [];

  dataRows.forEach((rawRow, dataIndex) => {
    if (isBlankRow(rawRow)) return;

    // +1 for the header row, +1 to make it 1-based for display.
    const rowNumber = dataIndex + 2;
    const classCode = String(
      rawRow[columnIndexByField.class_code] ?? ""
    ).trim();
    const attendanceNumber = Number(
      rawRow[columnIndexByField.attendance_number]
    );
    const studentIdNumber = String(
      rawRow[columnIndexByField.student_id_number] ?? ""
    ).trim();
    const lastName = String(rawRow[columnIndexByField.last_name] ?? "").trim();
    const firstName = String(
      rawRow[columnIndexByField.first_name] ?? ""
    ).trim();

    const invalidFields: string[] = [];
    if (!classCode) invalidFields.push(FIELD_LABELS.class_code);
    if (!Number.isInteger(attendanceNumber) || attendanceNumber <= 0) {
      invalidFields.push(FIELD_LABELS.attendance_number);
    }
    if (!studentIdNumber) invalidFields.push(FIELD_LABELS.student_id_number);
    if (!lastName) invalidFields.push(FIELD_LABELS.last_name);
    if (!firstName) invalidFields.push(FIELD_LABELS.first_name);

    if (invalidFields.length > 0) {
      formatErrors.push({
        rowNumber,
        message: `${invalidFields.join("、")}の値が不正です`,
      });
      return;
    }

    rows.push({
      class_code: classCode,
      attendance_number: attendanceNumber,
      student_id_number: studentIdNumber,
      last_name: lastName,
      first_name: firstName,
    });
  });

  if (rows.length === 0 && formatErrors.length === 0) {
    throw new Error("有効なデータ行が見つかりません。");
  }

  return { rows, formatErrors };
}
