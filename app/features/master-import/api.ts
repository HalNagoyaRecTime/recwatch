import { apiClient } from "~/lib/api-client";

export type MasterImportType = "students" | "classrooms" | "teachers";
export type MasterImportStatus = "validated" | "committed";

export interface MasterImportRowError {
  row_index: number;
  reason: string;
  [key: string]: unknown;
}

export interface MasterImportCommittedResult {
  imported: number;
  error_count: number;
  errors: MasterImportRowError[];
}

export interface MasterImportSessionDTO {
  import_id: string;
  type: MasterImportType;
  status: MasterImportStatus;
  file_name: string;
  total: number;
  success_count: number;
  error_count: number;
  errors: MasterImportRowError[];
  rows: Record<string, unknown>[];
  rows_total: number;
  rows_limit: number;
  rows_offset: number;
  created_at: string;
  committed_result: MasterImportCommittedResult | null;
}

export const masterImportApi = {
  create(type: MasterImportType, file: File) {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return apiClient.postForm<MasterImportSessionDTO>(
      "/api/v1/master-imports",
      form
    );
  },
  get(importId: string, params: { offset: number; limit: number }) {
    const query = new URLSearchParams({
      offset: String(params.offset),
      limit: String(params.limit),
    });
    return apiClient.get<MasterImportSessionDTO>(
      `/api/v1/master-imports/${importId}?${query.toString()}`
    );
  },
  commit(importId: string) {
    return apiClient.post<MasterImportSessionDTO>(
      `/api/v1/master-imports/${importId}/commit`,
      undefined
    );
  },
};
