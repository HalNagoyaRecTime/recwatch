import type {
  MasterImportCommittedResult,
  MasterImportRowError,
  MasterImportSession,
  MasterImportStatus,
  MasterImportType,
} from "./model/master-import-session";

type ApiMasterImportSession = {
  validated_file_id: string;
  type: MasterImportType;
  status: MasterImportStatus;
  file_name: string;
  total: number;
  success_count: number;
  error_count: number;
  errors: unknown[];
  rows: unknown[];
  rows_total: number;
  rows_limit: number;
  rows_offset: number;
  created_at: string;
  expires_at: string;
  committed_result: unknown;
};

const INVALID_RESPONSE_MESSAGE = "取り込み結果の形式が不正です。";

export function toMasterImportSession(response: unknown): MasterImportSession {
  if (!isApiMasterImportSession(response)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    importId: response.validated_file_id,
    type: response.type,
    status: response.status,
    fileName: response.file_name,
    total: response.total,
    successCount: response.success_count,
    errorCount: response.error_count,
    errors: response.errors.map(toRowError),
    rows: response.rows.filter(isRecord),
    rowsTotal: response.rows_total,
    rowsLimit: response.rows_limit,
    rowsOffset: response.rows_offset,
    createdAt: response.created_at,
    expiresAt: response.expires_at,
    committedResult: toCommittedResult(response.committed_result),
  };
}

function isApiMasterImportSession(
  value: unknown
): value is ApiMasterImportSession {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.validated_file_id) &&
    isMasterImportType(value.type) &&
    (value.status === "validated" || value.status === "committed") &&
    isNonEmptyString(value.file_name) &&
    isNonNegativeInteger(value.total) &&
    isNonNegativeInteger(value.success_count) &&
    isNonNegativeInteger(value.error_count) &&
    Array.isArray(value.errors) &&
    Array.isArray(value.rows) &&
    isNonNegativeInteger(value.rows_total) &&
    isNonNegativeInteger(value.rows_limit) &&
    isNonNegativeInteger(value.rows_offset) &&
    isNonEmptyString(value.created_at) &&
    isNonEmptyString(value.expires_at)
  );
}

function toRowError(value: unknown): MasterImportRowError {
  if (!isRecord(value) || !isNonNegativeInteger(value.row_index)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    ...value,
    rowIndex: value.row_index,
    reason: typeof value.reason === "string" ? value.reason : "unknown",
  };
}

function toCommittedResult(value: unknown): MasterImportCommittedResult | null {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    !isNonNegativeInteger(value.imported) ||
    !isNonNegativeInteger(value.error_count) ||
    !Array.isArray(value.errors)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    imported: value.imported,
    errorCount: value.error_count,
    errors: value.errors.map(toRowError),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isMasterImportType(value: unknown): value is MasterImportType {
  return value === "students" || value === "classrooms" || value === "teachers";
}
