export type MasterImportType = "students" | "classrooms" | "teachers";
export type MasterImportStatus = "validated" | "committed";

export interface MasterImportRowError {
  rowIndex: number;
  reason: string;
  [key: string]: unknown;
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
  rows: Record<string, unknown>[];
  rowsTotal: number;
  rowsLimit: number;
  rowsOffset: number;
  createdAt: string;
  expiresAt: string;
  committedResult: MasterImportCommittedResult | null;
}
