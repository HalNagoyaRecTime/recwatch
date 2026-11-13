import type { GatheringImportGateway } from "~/features/gathering-import/api/contracts/gathering-import-gateway";
import type { GatheringImportResult } from "~/features/gathering-import/model/gathering-import-result";
import { apiClient } from "~/lib/api-client";

type GatheringImportResultDto = {
  lock_version: number;
  total_rows: number;
  imported_rows: number;
  excluded_rows: number;
  rounds: {
    round: number;
    start_time: string | null;
    gatherings: {
      gathering_time: string;
      gathering_spot: { gathering_spot_name: string };
      members: { row_number: number; user_id: number; user_name: string }[];
    }[];
  }[];
  errors: {
    row_number: number;
    code: string;
    message: string;
    student: string;
  }[];
  warnings: { row_number: number; student: string; registered_name: string }[];
};

/** API は開始時刻を "HHmm" で返すため、画面表示用の "HH:mm" に揃える。 */
const formatStartTime = (value: string | null) =>
  value === null ? null : `${value.slice(0, 2)}:${value.slice(2)}`;

function toResult(dto: GatheringImportResultDto): GatheringImportResult {
  return {
    lockVersion: dto.lock_version,
    totalRows: dto.total_rows,
    importedRows: dto.imported_rows,
    excludedRows: dto.excluded_rows,
    rounds: dto.rounds.map((round) => ({
      round: round.round,
      startTime: formatStartTime(round.start_time),
      gatherings: round.gatherings.map((gathering) => ({
        time: gathering.gathering_time,
        spotName: gathering.gathering_spot.gathering_spot_name,
        members: gathering.members.map((member) => ({
          rowNumber: member.row_number,
          userId: member.user_id,
          name: member.user_name,
        })),
      })),
    })),
    errors: dto.errors.map((error) => ({
      rowNumber: error.row_number,
      code: error.code,
      message: error.message,
      student: error.student,
    })),
    warnings: dto.warnings.map((warning) => ({
      rowNumber: warning.row_number,
      student: warning.student,
      registeredName: warning.registered_name,
    })),
  };
}

export const httpGatheringImportGateway: GatheringImportGateway = {
  async preview(eventId, file) {
    const form = new FormData();
    form.append("file", file);
    return toResult(
      await apiClient.postForm<GatheringImportResultDto>(
        `/api/v1/events/${eventId}/gathering-imports/preview`,
        form
      )
    );
  },
  async commit(eventId, file, lockVersion) {
    const form = new FormData();
    form.append("file", file);
    form.append("lock_version", String(lockVersion));
    return toResult(
      await apiClient.postForm<GatheringImportResultDto>(
        `/api/v1/events/${eventId}/gathering-imports`,
        form
      )
    );
  },
};
