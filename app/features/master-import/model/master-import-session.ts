export type MasterImportType = "students" | "classrooms" | "teachers";
export type MasterImportStatus = "validated" | "committed";

export interface MasterImportRowError {
  rowIndex: number;
  reason: string;
  [key: string]: unknown;
}

export interface MasterImportExcludedRow {
  rowIndex: number;
  studentIdNumber: string;
  displayName: string;
  reason: string;
}

export interface MasterImportCommittedResult {
  imported: number;
  errorCount: number;
  errors: MasterImportRowError[];
}

export interface MasterImportSession {
  importId: string;
  type: MasterImportType;
  status: MasterImportStatus;
  fileName: string;
  total: number;
  successCount: number;
  errorCount: number;
  errors: MasterImportRowError[];
  excludedCount: number;
  excluded: MasterImportExcludedRow[];
  rows: Record<string, unknown>[];
  rowsTotal: number;
  rowsLimit: number;
  rowsOffset: number;
  createdAt: string;
  expiresAt: string;
  committedResult: MasterImportCommittedResult | null;
}
