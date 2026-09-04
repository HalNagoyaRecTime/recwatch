import { apiClient } from "~/lib/api-client";
import { toMasterImportSession } from "./master-import-response-mapper";
import type { MasterImportType } from "./model/master-import-session";

export type {
  MasterImportSession,
  MasterImportType,
} from "./model/master-import-session";

export const masterImportApi = {
  async create(type: MasterImportType, file: File) {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return toMasterImportSession(
      await apiClient.postForm<unknown>("/api/v1/master-imports", form)
    );
  },
  async get(importId: string, params: { offset: number; limit: number }) {
    const query = new URLSearchParams({
      offset: String(params.offset),
      limit: String(params.limit),
    });
    return toMasterImportSession(
      await apiClient.get<unknown>(
        `/api/v1/master-imports/${importId}?${query.toString()}`
      )
    );
  },
  async commit(importId: string) {
    return toMasterImportSession(
      await apiClient.post<unknown>(
        `/api/v1/master-imports/${importId}/commit`,
        undefined
      )
    );
  },
};
