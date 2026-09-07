import type { MasterImportType } from "./api";

export const MASTER_IMPORT_TYPE_LABEL: Record<MasterImportType, string> = {
  students: "学生",
  classrooms: "クラス",
  teachers: "教官",
};

export const MASTER_IMPORT_LIST_PATH: Record<MasterImportType, string> = {
  students: "/students",
  classrooms: "/classroom",
  teachers: "/teachers",
};

// 取り込み確認画面は従来どおり共通入口を使う。学生画面のURL移行に合わせて入口だけ変更する。
export const MASTER_IMPORT_CONFIRMATION_PATH: Record<MasterImportType, string> =
  {
    students: "/students/import",
    classrooms: "/students/import",
    teachers: "/students/import",
  };

export const MASTER_IMPORT_COLUMN_LABEL: Record<string, string> = {
  class_code: "クラス記号",
  class_name: "クラス名",
  attendance_number: "出席番号",
  student_id_number: "学籍番号",
  last_name: "氏名（姓）",
  first_name: "氏名（名）",
};

export const MASTER_IMPORT_ERROR_REASON_LABEL: Record<string, string> = {
  student_id_number_duplicate_in_file: "学籍番号がファイル内で重複しています",
  student_id_number_duplicate_in_db: "学籍番号が既に登録されています",
  class_code_duplicate_in_file: "クラスコードがファイル内で重複しています",
  class_code_duplicate_in_db: "クラスコードが既に登録されています",
};
