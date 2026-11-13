import type { GatheringImportResult } from "~/features/gathering-import/model/gathering-import-result";

export type GatheringImportGateway = {
  preview(eventId: number, file: File): Promise<GatheringImportResult>;
  commit(
    eventId: number,
    file: File,
    lockVersion: number
  ): Promise<GatheringImportResult>;
};
